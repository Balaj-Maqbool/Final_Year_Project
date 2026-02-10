import { sseManager } from "../streams/SSEManager.js";
import { User } from "../models/user.model.js";
import { ValidationHelper } from "../utils/validation.utils.js";

class NotificationService {
    static async notifyNewBid(job, bid) {
        await sseManager.sendToUser(job.poster_id, "DASHBOARD_UPDATE", {
            type: "NEW_BID",
            message: "New bid received on your job",
            jobId: job._id,
            bidId: bid._id
        });
    }

    static async notifyBidStatusUpdate(freelancerId, job, status) {
        await sseManager.sendToUser(freelancerId, "DASHBOARD_UPDATE", {
            type: "BID_STATUS_UPDATE",
            message: `Your bid was ${status}`,
            jobId: job._id
        });
    }

    static async notifyBidWithdrawn(jobPosterId, jobId) {
        await sseManager.sendToUser(jobPosterId, "DASHBOARD_UPDATE", {
            type: "BID_WITHDRAWN",
            message: "A freelancer withdrew their bid",
            jobId: jobId
        });
    }

    static async notifyNewJob(job) {
        sseManager.broadcast(
            "NEW_JOB_AVAILABLE",
            {
                message: "New Job Posted",
                job
            },
            "Freelancer"
        );

        if (!ValidationHelper.isEmpty(job.required_skills)) {
            try {
                const matchedFreelancers = await User.find({
                    role: "Freelancer",
                    skills: { $in: job.required_skills }
                }).select("_id");

                matchedFreelancers.forEach((user) => {
                    sseManager.sendToUser(user._id, "DASHBOARD_UPDATE", {
                        type: "JOB_MATCH",
                        message: `New job matches your skills: ${job.title}`,
                        jobId: job._id
                    });
                });
            } catch (error) {
                console.error("Error in notifyNewJob skill matching:", error);
            }
        }
    }

    static async notifyJobCompleted(freelancerId, job) {
        await sseManager.sendToUser(freelancerId, "DASHBOARD_UPDATE", {
            type: "JOB_COMPLETED",
            message: `Job '${job.title}' has been marked as Completed`,
            jobId: job._id
        });
    }

    static async notifyNewTask(freelancerId, task) {
        await sseManager.sendToUser(freelancerId, "DASHBOARD_UPDATE", {
            type: "NEW_TASK",
            message: "New task assigned to you",
            taskId: task._id
        });
    }

    static async notifyTaskStatusUpdate(jobPosterId, task, status) {
        await sseManager.sendToUser(jobPosterId, "DASHBOARD_UPDATE", {
            type: "TASK_STATUS_UPDATE",
            message: `Task '${task.title}' moved to ${status}`,
            taskId: task._id
        });
    }

    static async notifyTaskApproved(freelancerId, task) {
        await sseManager.sendToUser(freelancerId, "DASHBOARD_UPDATE", {
            type: "TASK_APPROVED",
            message: `Your task '${task.title}' was approved`,
            taskId: task._id
        });
    }

    static async notifyNewRating(freelancerId, job, rating) {
        await sseManager.sendToUser(freelancerId, "DASHBOARD_UPDATE", {
            type: "NEW_RATING",
            message: `You received a ${rating}-star rating on job '${job.title}'`,
            jobId: job._id
        });
    }
    static async notifyChatInitiated(recipientId, requester) {
        await sseManager.sendToUser(recipientId, "DASHBOARD_UPDATE", {
            type: "CHAT_INITIATED",
            message: `${requester.fullName} started a chat with you`,
            requesterId: requester._id
        });
    }
}

export { NotificationService };
