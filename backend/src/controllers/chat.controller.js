import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ChatThread, Message } from "../models/chat.model.js";
import { Bid } from "../models/bid.model.js";
import { NotificationService } from "../services/notification.service.js";
import { ValidationHelper } from "../utils/validation.utils.js";
import mongoose from "mongoose";

/**
 * Lazy Initialization of Chat Thread.
 * Called when a Client initiates a chat with a Freelancer from a Bid.
 */
const initializeChat = asyncHandler(async (req, res) => {
    const { bidId } = req.params;
    console.log(bidId);


    ValidationHelper.validateId(bidId, "Invalid Bid ID");


    const existingThread = await ChatThread.findOne({ bidId });
    if (existingThread) {
        // If it was hidden for this user, unhide it
        if (existingThread.hiddenFor.includes(req.user._id)) {
            existingThread.hiddenFor = existingThread.hiddenFor.filter(
                id => id.toString() !== req.user._id.toString()
            );
            await existingThread.save();
        }

        return res.status(200).json(
            new ApiResponse(200, existingThread, "Chat thread retrieved successfully")
        );
    }


    const bid = await Bid.findById(bidId);
    if (!bid) {
        throw new ApiError(404, "Bid not found");
    }

    // Security: Only Job Poster (Client) or Bidder (Freelancer) can start


    await bid.populate("job_id");
    const job = bid.job_id;

    if (!job) {
        throw new ApiError(404, "Associated Job not found");
    }

    // Security: Only Job Poster (Client) can start a new conversation
    if (req.user.role !== "Client") {
        throw new ApiError(403, "Only the Client can initiate a new conversation.");
    }

    const participants = [job.poster_id, bid.user_id];


    if (!participants.some(p => p.toString() === req.user._id.toString())) {
        throw new ApiError(403, "You are not authorized to start this chat");
    }


    const newThread = await ChatThread.create({
        participants,
        jobId: job._id,
        bidId: bid._id
    });


    const recipientId = participants.find(p => p.toString() !== req.user._id.toString());
    await NotificationService.notifyChatInitiated(recipientId, req.user);

    return res.status(201).json(
        new ApiResponse(201, newThread, "Chat initiated successfully")
    );
});

/**
 * Get all threads for the current user.
 * Filters out threads hidden by the user.
 */
const getMyThreads = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const aggregate = ChatThread.aggregate([
        {
            $match: {
                participants: req.user._id,
                hiddenFor: { $ne: req.user._id }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "participants",
                foreignField: "_id",
                as: "participants",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            profileImage: 1,
                            email: 1
                        }
                    }
                ]
            }
        },
        {
            $sort: { "lastMessage.timestamp": -1 }
        }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const threads = await ChatThread.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, threads, "Chats retrieved successfully")
    );
});

/**
 * Get messages for a specific thread with pagination.
 */
const getThreadMessages = asyncHandler(async (req, res) => {
    const { threadId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    ValidationHelper.validateId(threadId, "Invalid Thread ID");


    const thread = await ChatThread.findById(threadId);
    if (!thread || !thread.participants.includes(req.user._id)) {
        throw new ApiError(404, "Chat thread not found or access denied");
    }


    const aggregate = Message.aggregate([
        { $match: { threadId: new mongoose.Types.ObjectId(threadId) } },
        { $sort: { createdAt: -1 } }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const messages = await Message.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, messages, "Messages retrieved successfully")
    );
});

/**
 * Soft Delete a Message.
 */
const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;

    ValidationHelper.validateId(messageId, "Invalid Message ID");

    const message = await Message.findById(messageId);
    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    if (message.from.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own messages");
    }

    message.isDeleted = true;
    message.content = "This message was deleted"; // Placeholder
    await message.save();

    // Broadcast Deletion Event
    await chatManager.broadcastToThread(message.threadId, {
        type: "MESSAGE_DELETED",
        messageId: message._id,
        threadId: message.threadId
    });

    return res.status(200).json(
        new ApiResponse(200, message, "Message deleted successfully")
    );
});

/**
 * Hide/Delete Thread for Me.
 */
const deleteThread = asyncHandler(async (req, res) => {
    const { threadId } = req.params;

    ValidationHelper.validateId(threadId, "Invalid Thread ID");

    const thread = await ChatThread.findById(threadId);
    if (!thread) {
        throw new ApiError(404, "Thread not found");
    }

    if (!thread.participants.includes(req.user._id)) {
        throw new ApiError(403, "Access denied");
    }

    // Add user to hiddenFor array if not already there
    if (!thread.hiddenFor.includes(req.user._id)) {
        thread.hiddenFor.push(req.user._id);
        await thread.save();
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Chat thread deleted from your view")
    );
});

const blockThread = asyncHandler(async (req, res) => {
    const { threadId } = req.params;

    ValidationHelper.validateId(threadId, "Invalid Thread ID");

    const thread = await ChatThread.findById(threadId);
    if (!thread) throw new ApiError(404, "Thread not found");

    if (!thread.participants.includes(req.user._id)) {
        throw new ApiError(403, "Access denied");
    }
    if (thread.status == "blocked") {
        throw new ApiError(403, "Thread is already blocked");
    }

    thread.status = "blocked";
    thread.blockedBy = req.user._id;
    await thread.save();

    return res.status(200).json(new ApiResponse(200, thread, "Thread blocked"));
});

const unblockThread = asyncHandler(async (req, res) => {
    const { threadId } = req.params;

    ValidationHelper.validateId(threadId, "Invalid Thread ID");

    const thread = await ChatThread.findById(threadId);
    if (!thread) throw new ApiError(404, "Thread not found");

    if (thread.blockedBy && thread.blockedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the user who blocked this thread can unblock it");
    }

    if (thread.status == "active") {
        throw new ApiError(403, "Thread is already unblocked");
    }

    thread.status = "active";
    thread.blockedBy = null;
    await thread.save();

    return res.status(200).json(new ApiResponse(200, thread, "Thread unblocked"));
});


const markMessagesAsRead = asyncHandler(async (req, res) => {
    const { threadId } = req.params;

    ValidationHelper.validateId(threadId, "Invalid Thread ID");


    const thread = await ChatThread.findById(threadId);
    if (!thread || !thread.participants.includes(req.user._id)) {
        throw new ApiError(404, "Thread not found or access denied");
    }


    await Message.updateMany(
        {
            threadId,
            from: { $ne: req.user._id },
            status: { $ne: "read" }
        },
        { $set: { status: "read" } }
    );


    if (thread.unreadCounts) {
        thread.unreadCounts.set(req.user._id.toString(), 0);
        await thread.save();
    }


    await chatManager.broadcastToThread(threadId, {
        type: "MESSAGES_READ",
        threadId,
        readerId: req.user._id
    });

    return res.status(200).json(new ApiResponse(200, {}, "Messages marked as read"));
});

export {
    initializeChat,
    getMyThreads,
    getThreadMessages,
    deleteMessage,
    deleteThread,
    blockThread,
    unblockThread,
    markMessagesAsRead
};
