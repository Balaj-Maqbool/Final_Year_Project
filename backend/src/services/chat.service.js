import { ChatThread, Message } from "../models/chat.model.js";
import { Bid } from "../models/bid.model.js";
import { sseManager } from "../streams/SSEManager.js";
import { ApiError } from "../utils/ApiError.js";

class ChatService {
    /**
     * Validates if a user has permission to send a message in a thread.
     * Rules:
     * - Rejected Bids: No one can talk.
     * - Pending Bids: Freelancer limited to 10 messages.
     * - Accepted Bids: Unlimited.
     */
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
        } else if (bid.status === "Pending" && user.role === "Freelancer") {
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

        // 2. Update Thread Metadata
        thread.lastMessage = {
            content,
            senderId: sender._id,
            timestamp: message.createdAt
        };
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
