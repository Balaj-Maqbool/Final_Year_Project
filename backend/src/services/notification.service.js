import { socketManager } from "../streams/SocketManager.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { ValidationHelper } from "../utils/validation.utils.js";

class NotificationService {
    static async #createAndSend(recipientId, type, message, relatedId) {
        try {
            const notification = await Notification.create({
                recipient: recipientId,
                type,
                message,
                relatedId
            });

            // Emit to the specific user's room
            socketManager.emitToRoom(recipientId.toString(), "new_notification", notification);
            
            return notification;
        } catch (error) {
            console.error(`Failed to create/send notification to ${recipientId}:`, error);
        }
    }

    static async notifyNewBid(job, bid) {
        await this.#createAndSend(
            job.poster_id,
            "NEW_BID",
            "New bid received on your job",
            job._id // relatedId
        );
    }

    static async notifyBidStatusUpdate(freelancerId, job, status) {
        await this.#createAndSend(
            freelancerId,
            "BID_STATUS_UPDATE",
            `Your bid was ${status}`,
            job._id
        );
    }

    static async notifyBidWithdrawn(jobPosterId, jobId) {
        await this.#createAndSend(
            jobPosterId,
            "BID_WITHDRAWN",
            "A freelancer withdrew their bid",
            jobId
        );
    }

    static async notifyNewJob(job) {
        // For broadcasting new jobs, we might not want to create a notification in DB for EVERY user immediately 
        // unless we want to populate their feed. 
        // For "NEW_JOB_AVAILABLE", let's just emit to all freelancers without DB for now 
        // OR better, checking how sseManager.broadcast worked. It didn't save to DB. 
        // "socketManager" doesn't have broadcast method exposed easily for roles, but we can iterate or use a room if we had one.
        // For now, let's skip broadcasting via socket if we don't have a "Freelancers" room, 
        // or just rely on the skill match notifications which are more targeted.
        
        // Actually, the original code called sseManager.broadcast WITHOUT saveToDb (implied by broadcast implementation in sseManager? No, broadcast uses emitToRoom logic but doesn't call create).
        // sseManager.broadcast did NOT save to DB.
        
        // We will skip global broadcast for now as it might be too noisy, 
        // and focus on skill matching which IS saved.
        
        if (!ValidationHelper.isEmpty(job.required_skills)) {
            try {
                const matchedFreelancers = await User.find({
                    role: "Freelancer",
                    skills: { $in: job.required_skills }
                }).select("_id");

                for (const user of matchedFreelancers) {
                   await this.#createAndSend(
                        user._id,
                        "JOB_MATCH",
                        `New job matches your skills: ${job.title}`,
                        job._id
                    );
                }
            } catch (error) {
                console.error("Error in notifyNewJob skill matching:", error);
            }
        }
    }

    static async notifyJobCompleted(freelancerId, job) {
        await this.#createAndSend(
            freelancerId,
            "JOB_COMPLETED",
            `Job '${job.title}' has been marked as Completed`,
            job._id
        );
    }

    static async notifyNewTask(freelancerId, task) {
        await this.#createAndSend(
            freelancerId,
            "NEW_TASK",
            "New task assigned to you",
            task._id
        );
    }

    static async notifyTaskStatusUpdate(jobPosterId, task, status) {
        await this.#createAndSend(
            jobPosterId,
            "TASK_STATUS_UPDATE",
            `Task '${task.title}' moved to ${status}`,
            task._id
        );
    }

    static async notifyTaskApproved(freelancerId, task) {
        await this.#createAndSend(
            freelancerId,
            "TASK_APPROVED",
            `Your task '${task.title}' was approved`,
            task._id
        );
    }

    static async notifyNewRating(freelancerId, job, rating) {
        await this.#createAndSend(
            freelancerId,
            "NEW_RATING",
            `You received a ${rating}-star rating on job '${job.title}'`,
            job._id
        );
    }

    static async notifyChatInitiated(recipientId, requester) {
        await this.#createAndSend(
            recipientId,
            "CHAT_INITIATED",
            `${requester.fullName} started a chat with you`,
            requester._id // relatedId is sender for chat
        );
    }
}

export { NotificationService };
