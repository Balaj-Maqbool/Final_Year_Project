import { ChatThread, Message } from "../models/chat.model.js";
import { Bid } from "../models/bid.model.js";
import { ValidationHelper } from "../utils/validation.utils.js";

class ChatService {
    async validateMessagePermission(threadId, userId) {
        if (!ValidationHelper.isValidObjectId(threadId)) {
            return { canSend: false, error: "Invalid Thread ID" };
        }

        const thread = await ChatThread.findById(threadId);
        if (!thread) {
            return { canSend: false, error: "Chat Thread not found" };
        }

        if (!thread.participants.includes(userId)) {
            return { canSend: false, error: "You are not a participant in this chat" };
        }

        if (thread.status === "blocked") {
            return { canSend: false, error: "This chat is blocked" };
        }

        const bid = await Bid.findById(thread.bidId);
        if (!bid) {
            return { canSend: false, error: "Associated Bid not found" };
        }

        if (["Rejected", "Withdrawn"].includes(bid.status)) {
            return { canSend: false, error: `Cannot send message. Bid is ${bid.status}.` };
        }

        return { canSend: true, thread };
    }

    async saveMessage(threadId, senderId, content, attachments = [], status = "sent", replyTo = null) {
        const thread = await ChatThread.findById(threadId);
        if (!thread) throw new Error("Thread not found");

        const participantIds = thread.participants.map((p) => p.toString());
        const recipientId = participantIds.find((id) => id !== senderId.toString());

        if (ValidationHelper.isEmpty(content) && ValidationHelper.isEmpty(attachments)) {
            throw new Error("Message cannot be empty. Post text or an attachment.");
        }

        if (ValidationHelper.isEmpty(content) && !ValidationHelper.isEmpty(attachments)) {
            content = "Sent an attachment";
        }

        const message = await Message.create({
            threadId,
            from: senderId,
            to: recipientId,
            content,
            attachments,
            status: status,
            replyTo: replyTo
        });

        const currentUnread = thread.unreadCounts?.get(recipientId) || 0;

        if (!thread.unreadCounts) {
            thread.unreadCounts = new Map();
        }

        thread.unreadCounts.set(recipientId, currentUnread + 1);

        thread.lastMessage = {
            content: content || (attachments.length ? "📎 Attachment" : "New Message"),
            from: senderId,
            timestamp: new Date()
        };

        if (thread.hiddenFor.includes(recipientId)) {
            thread.hiddenFor = thread.hiddenFor.filter((id) => id.toString() !== recipientId);
        }

        await thread.save();

        return message;
    }

    async markMessagesAsRead(threadId, userId) {
        await Message.updateMany(
            {
                threadId,
                to: userId,
                status: { $ne: "read" }
            },
            { $set: { status: "read" } }
        );

        const thread = await ChatThread.findById(threadId);
        if (thread && thread.unreadCounts) {
            if (thread.unreadCounts.get(userId.toString()) > 0) {
                thread.unreadCounts.set(userId.toString(), 0);
                await thread.save();
                return true;
            }
        }
        return false;
    }
}

export const chatService = new ChatService();
