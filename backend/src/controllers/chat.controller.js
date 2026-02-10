import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ChatThread, Message } from "../models/chat.model.js";
import { Bid } from "../models/bid.model.js";
import { NotificationService } from "../services/notification.service.js";
import { ValidationHelper } from "../utils/validation.utils.js";
import { socketManager } from "../streams/SocketManager.js";
import { chatService } from "../services/chat.service.js";
import { CloudinaryHelper } from "../utils/cloudinary.utils.js";
import mongoose from "mongoose";

/**
 * Lazy Initialization of Chat Thread.
 */
const initializeChat = asyncHandler(async (req, res) => {
    const { bidId } = req.params;

    ValidationHelper.validateId(bidId, "Invalid Bid ID");

    // 1. Check if thread already exists
    const existingThread = await ChatThread.findOne({ bidId });
    if (existingThread) {
        // If it was hidden for this user, unhide it
        if (existingThread.hiddenFor.includes(req.user._id)) {
            existingThread.hiddenFor = existingThread.hiddenFor.filter(
                (id) => id.toString() !== req.user._id.toString()
            );
            await existingThread.save();
        }

        return res.status(200).json(new ApiResponse(200, existingThread, "Chat thread retrieved successfully"));
    }

    // 2. Fetch Bid details
    const bid = await Bid.findById(bidId);
    if (!bid) {
        throw new ApiError(404, "Bid not found");
    }

    await bid.populate("job_id");
    const job = bid.job_id;

    if (!job) {
        throw new ApiError(404, "Associated Job not found");
    }

    if (req.user.role !== "Client") {
        throw new ApiError(403, "Only the Client can initiate a new conversation.");
    }

    const participants = [job.poster_id, bid.user_id];

    if (!participants.some((p) => p.toString() === req.user._id.toString())) {
        throw new ApiError(403, "You are not authorized to start this chat");
    }

    // 3. Create New Thread
    const newThread = await ChatThread.create({
        participants,
        jobId: job._id,
        bidId: bid._id
    });

    // 4. Notify (DB Notification for this important event)
    const recipientId = participants.find((p) => p.toString() !== req.user._id.toString());
    await NotificationService.notifyChatInitiated(recipientId, req.user);

    return res.status(201).json(new ApiResponse(201, newThread, "Chat initiated successfully"));
});

/**
 * Get all threads for the current user.
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

    return res.status(200).json(new ApiResponse(200, threads, "Chats retrieved successfully"));
});

/**
 * Get messages for a specific thread.
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
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "messages",
                localField: "replyTo",
                foreignField: "_id",
                as: "replyTo",
                pipeline: [
                    {
                        $project: {
                            content: 1,
                            attachments: 1,
                            from: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$replyTo",
                preserveNullAndEmptyArrays: true
            }
        }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const messages = await Message.aggregatePaginate(aggregate, options);

    return res.status(200).json(new ApiResponse(200, messages, "Messages retrieved successfully"));
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

    // 1. Delete attachments from Cloudinary (Prevent Orphaned Files)
    if (!ValidationHelper.isEmpty(message.attachments)) {
        const deletePromises = message.attachments.map(async (att) => {
            if (att.publicId) {
                await CloudinaryHelper.delete(att.publicId, att.resourceType || "image");
            }
        });
        await Promise.all(deletePromises);
    }

    message.isDeleted = true;
    message.content = "This message was deleted";
    message.attachments = []; // Clear attachments in DB
    await message.save();

    // Broadcast Deletion Event via Socket
    socketManager.emitToRoom(message.threadId.toString(), "message_deleted", {
        messageId: message._id,
        threadId: message.threadId
    });

    return res.status(200).json(new ApiResponse(200, message, "Message deleted successfully"));
});

/**
 * Hide Thread for Me.
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

    if (!thread.hiddenFor.includes(req.user._id)) {
        thread.hiddenFor.push(req.user._id);
        await thread.save();
    }

    return res.status(200).json(new ApiResponse(200, {}, "Chat thread deleted from your view"));
});

const blockThread = asyncHandler(async (req, res) => {
    const { threadId } = req.params;
    ValidationHelper.validateId(threadId, "Invalid Thread ID");

    const thread = await ChatThread.findById(threadId);
    if (!thread) throw new ApiError(404, "Thread not found");

    if (!thread.participants.includes(req.user._id)) {
        throw new ApiError(403, "Access denied");
    }
    if (thread.status === "blocked") {
        throw new ApiError(403, "Thread is already blocked");
    }

    thread.status = "blocked";
    thread.blockedBy = req.user._id;
    await thread.save();

    // Broadcast Block Event
    socketManager.emitToRoom(threadId, "thread_blocked", {
        threadId,
        blockedBy: req.user._id
    });

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

    if (thread.status === "active") {
        throw new ApiError(403, "Thread is already unblocked");
    }

    thread.status = "active";
    thread.blockedBy = null;
    await thread.save();

    // Broadcast Unblock Event
    socketManager.emitToRoom(threadId, "thread_unblocked", {
        threadId,
        unblockedBy: req.user._id
    });

    return res.status(200).json(new ApiResponse(200, thread, "Thread unblocked"));
});

const markMessagesAsRead = asyncHandler(async (req, res) => {
    const { threadId } = req.params;
    ValidationHelper.validateId(threadId, "Invalid Thread ID");

    // Delegate to Service
    const success = await chatService.markMessagesAsRead(threadId, req.user._id);

    if (success) {
        // Broadcast Read Receipt
        socketManager.emitToRoom(threadId, "messages_read", {
            threadId,
            readerId: req.user._id
        });
    }

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
    markMessagesAsRead // exported
};
