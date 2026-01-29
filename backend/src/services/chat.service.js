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

        // 3. Rate Limit for Pending Bids (Freelancer only)
        if (bid.status === "Pending" && user.role === "Freelancer") {
            const messageCount = await Message.countDocuments({
                threadId: thread._id,
                senderId: user._id
            });

            if (messageCount >= 10) {
                return {
                    canSend: false,
                    reason: "Limit reached: You can only send 10 messages until your bid is accepted"
                };
            }
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
        thread.lastMessage = {
            content,
            senderId: sender._id,
            timestamp: message.createdAt
        };
        // Unhide for all participants (they should see the new message)
        thread.hiddenFor = [];
        await thread.save();

        // 3. Trigger Notifications for participants
        const participantsToNotify = thread.participants.filter(
            id => id.toString() !== sender._id.toString()
        );

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
