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
    const { bidId } = req.body;

    ValidationHelper.validateId(bidId, "Invalid Bid ID");

    // 1. Check if thread already exists
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

    // 2. Fetch Bid details to find participants
    const bid = await Bid.findById(bidId);
    if (!bid) {
        throw new ApiError(404, "Bid not found");
    }

    // Security: Only Job Poster (Client) or Bidder (Freelancer) can start
    // Typically Client starts, but maybe Freelancer can too if allowed? 
    // For now, let's assume either participant of the bid can init.
    // But logically, Bid has: job_id (-> poster) and user_id (-> freelancer).

    // We need to fetch the job to get the poster ID? 
    // Bid model usually stores job_id. We might need to populate job to get poster info if not in Bid.
    // Let's assume we need to populate.
    await bid.populate("job_id");
    const job = bid.job_id;

    if (!job) {
        throw new ApiError(404, "Associated Job not found");
    }

    const participants = [job.poster_id, bid.user_id];

    // Ensure requester is one of them
    if (!participants.some(p => p.toString() === req.user._id.toString())) {
        throw new ApiError(403, "You are not authorized to start this chat");
    }

    // 3. Create New Thread
    const newThread = await ChatThread.create({
        participants,
        jobId: job._id,
        bidId: bid._id
    });

    // 4. Notify the OTHER participant
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
    const threads = await ChatThread.find({
        participants: req.user._id,
        hiddenFor: { $ne: req.user._id } // Exclude hidden threads
    })
        .populate("participants", "fullName profileImage email")
        .sort({ "lastMessage.timestamp": -1 }); // Recently active first

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

    // Verify membership
    const thread = await ChatThread.findById(threadId);
    if (!thread || !thread.participants.includes(req.user._id)) {
        throw new ApiError(404, "Chat thread not found or access denied");
    }

    const messages = await Message.find({ threadId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    // Reverse to show oldest to newest on frontend (or handle in frontend)
    // Typically APIs return newest first for pagination efficiency.

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

    if (message.senderId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own messages");
    }

    message.isDeleted = true;
    message.content = "This message was deleted"; // Placeholder
    await message.save();

    // Ideally, we should also emit a socket event 'MESSAGE_DELETED' to update real-time
    // But for this MVP controller scope, we just update DB.

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

    thread.status = "active";
    thread.blockedBy = null;
    await thread.save();

    return res.status(200).json(new ApiResponse(200, thread, "Thread unblocked"));
});


export {
    initializeChat,
    getMyThreads,
    getThreadMessages,
    deleteMessage,
    deleteThread,
    blockThread,
    unblockThread
};
