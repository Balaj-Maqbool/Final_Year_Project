import { ChatThread, Message } from "../models/chat.model.js";
import { Bid } from "../models/bid.model.js";
import { ValidationHelper } from "../utils/validation.utils.js";

class ChatService {
    /**
     * Validate if a user can send a message to a thread.
     * Checks:
     * 1. Is participant?
     * 2. Is Bid active/pending (not rejected)?
     * @returns {Promise<{canSend: boolean, error?: string}>}
     */
    async validateMessagePermission(threadId, userId) {
        if (!ValidationHelper.isValidObjectId(threadId)) {
            return { canSend: false, error: "Invalid Thread ID" };
        }

        const thread = await ChatThread.findById(threadId);
        if (!thread) {
            return { canSend: false, error: "Chat Thread not found" };
        }

        // 1. Participant Check
        if (!thread.participants.includes(userId)) {
            return { canSend: false, error: "You are not a participant in this chat" };
        }

        // 2. Blocked Check
        if (thread.status === "blocked") {
            return { canSend: false, error: "This chat is blocked" };
        }

        // 3. Bid Status Check
        // We need to fetch the Bid to check its status.
        const bid = await Bid.findById(thread.bidId);
        if (!bid) {
            // Should technically not happen if thread exists, but safeguard
            return { canSend: false, error: "Associated Bid not found" };
        }

        // Refined Logic based on CHAT_ARCHITECTURE.md
        // Pending: Text Allowed. Files Blocked (handled in controller/socket payload check).
        // Accepted: Everything Allowed.
        // Rejected/Withdrawn: Blocked.
        if (["Rejected", "Withdrawn"].includes(bid.status)) {
            return { canSend: false, error: `Cannot send message. Bid is ${bid.status}.` };
        }

        return { canSend: true, thread };
    }

    /**
     * Persist a new message and update the thread.
     */
    async saveMessage(threadId, senderId, content, attachments = [], status = "sent", replyTo = null) {
        const thread = await ChatThread.findById(threadId);
        if (!thread) throw new Error("Thread not found");

        const participantIds = thread.participants.map(p => p.toString());
        const recipientId = participantIds.find(id => id !== senderId.toString());

        // 1. Validation: Must have Content OR Attachments
        if (!content && (!attachments || attachments.length === 0)) {
            throw new Error("Message cannot be empty. Post text or an attachment.");
        }

        // 2. Handle "Attachment Only" messages (Mongoose requires content)
        if (!content && attachments.length > 0) {
            content = "Sent an attachment";
        }

        // 3. Create Message
        const message = await Message.create({
            threadId,
            from: senderId,
            to: recipientId,
            content,
            attachments,
            status: status,
            replyTo: replyTo
        });

        // 2. Update Thread (Last Message + Unread Count)
        const currentUnread = thread.unreadCounts?.get(recipientId) || 0;

        // Ensure map exists
        if (!thread.unreadCounts) {
            thread.unreadCounts = new Map();
        }

        thread.unreadCounts.set(recipientId, currentUnread + 1);

        thread.lastMessage = {
            content: content || (attachments.length ? "📎 Attachment" : "New Message"),
            from: senderId,
            timestamp: new Date()
        };

        // If thread was hidden/archived for recipient, allow it to reappear (optional, good UX)
        if (thread.hiddenFor.includes(recipientId)) {
            thread.hiddenFor = thread.hiddenFor.filter(id => id.toString() !== recipientId);
        }

        await thread.save();

        return message;
    }

    /**
     * Mark messages as read for a user in a thread.
     */
    async markMessagesAsRead(threadId, userId) {
        // 1. Update Messages
        await Message.updateMany(
            {
                threadId,
                to: userId, // Messages sent TO this user
                status: { $ne: "read" }
            },
            { $set: { status: "read" } }
        );

        // 2. Reset Thread Unread Count
        const thread = await ChatThread.findById(threadId);
        if (thread && thread.unreadCounts) {
            // Only save if it actually changes to save DB write
            if (thread.unreadCounts.get(userId.toString()) > 0) {
                thread.unreadCounts.set(userId.toString(), 0);
                await thread.save();
                return true; // Indicates update happened
            }
        }
        return false;
    }
}

export const chatService = new ChatService();
