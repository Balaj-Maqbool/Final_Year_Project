import { Message } from "../models/chat.model.js";
import { Bid } from "../models/bid.model.js";
import { sseManager } from "../streams/SSEManager.js";
import { ApiError } from "../utils/ApiError.js";

class ChatService {
    static async validateMessagePermission(thread, user) {
        const bid = await Bid.findById(thread.bidId);

        if (!bid) {
            throw new ApiError(404, "Associated bid not found");
        }

        // 1. Block if bid is Rejected
        if (bid.status === "Rejected") {
            return {
                canSend: false,
                reason: "Chat disabled: Bid was rejected"
            };
        }

        // 2. Check if Thread itself is blocked
        if (thread.status === "blocked") {
            return {
                canSend: false,
                reason: "Chat disabled: This conversation has been blocked"
            };
        }
        return { canSend: true };
    }

    /**
     * Handles persistence and side-effects of a new message
     */
    static async processNewMessage(thread, sender, content, attachments = []) {
        // 1. Create Message
        const message = await Message.create({
            threadId: thread._id,
            senderId: sender._id,
            content,
            attachments
        });

        // 2. Update Thread Metadata & Unhide
        // 2. Update Thread Metadata & Unhide
        thread.lastMessage = {
            content,
            senderId: sender._id,
            timestamp: message.createdAt
        };
        thread.hiddenFor = [];

        // Increment unread count for RECIPIENTS (everyone except sender)
        const participantsToNotify = thread.participants.filter(
            id => id.toString() !== sender._id.toString()
        );

        // Note: Mix of $set and $inc is simpler with findOneAndUpdate or direct assignment if we loaded the doc.
        // Since we have 'thread' loaded, let's update it in memory and save.


        participantsToNotify.forEach(pId => {
            const currentCount = thread.unreadCounts.get(pId.toString()) || 0;
            thread.unreadCounts.set(pId.toString(), currentCount + 1);
        });

        await thread.save();

        // 3. Trigger Notifications for participants
        participantsToNotify.forEach(participantId => {
            sseManager.sendToUser(participantId, "NEW_CHAT_MESSAGE", {
                type: "CHAT",
                message: `New message from ${sender.username}`,
                threadId: thread._id,
                content: content.substring(0, 50) + (content.length > 50 ? "..." : "")
            }, true); // Save notification to DB
        });

        return message;
    }
}


export { ChatService };
