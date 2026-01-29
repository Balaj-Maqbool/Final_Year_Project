import { sseManager } from "../streams/SSEManager.js";
import { User } from "../models/user.model.js";

/**
 * NotificationService centralizes all domain-specific real-time alerts.
 * Relieves controllers of searching for users and managing SSE payloads.
 */
class NotificationService {
    /**
     * Notify job poster about a new bid.
     */
    static async notifyNewBid(job, bid) {
        return sseManager.sendToUser(job.poster_id, "DASHBOARD_UPDATE", {
            type: "NEW_BID",
            message: "New bid received on your job",
            jobId: job._id,
            bidId: bid._id
        });
    }

    /**
     * Notify freelancer about bid status (Accepted/Rejected).
     */
    static async notifyBidStatusUpdate(freelancerId, job, status) {
        return sseManager.sendToUser(freelancerId, "DASHBOARD_UPDATE", {
            type: "BID_STATUS_UPDATE",
            message: `Your bid was ${status}`,
            jobId: job._id
        });
    }

    /**
     * Notify job poster that a freelancer withdrew their bid.
     */
    static async notifyBidWithdrawn(jobPosterId, jobId) {
        return sseManager.sendToUser(jobPosterId, "DASHBOARD_UPDATE", {
            type: "BID_WITHDRAWN",
            message: "A freelancer withdrew their bid",
            jobId: jobId
        });
    }

    /**
     * Broadcast new job to all relevant freelancers.
     * If the job has required skills, it only notifies matching freelancers.
     */
    static async notifyNewJob(job) {
        // 1. Global Broadcast for the general feed
        sseManager.broadcast("NEW_JOB_AVAILABLE", {
            message: "New Job Posted",
            job
        }, "Freelancer");

        // 2. Targeted Notifications for skill matches
        if (job.required_skills && job.required_skills.length > 0) {
            try {
                const matchedFreelancers = await User.find({
                    role: "Freelancer",
                    skills: { $in: job.required_skills }
                }).select("_id");

                matchedFreelancers.forEach(user => {
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

    /**
     * Notify freelancer that a job has been marked as completed.
     */
    static async notifyJobCompleted(freelancerId, job) {
        return sseManager.sendToUser(freelancerId, "DASHBOARD_UPDATE", {
            type: "JOB_COMPLETED",
            message: `Job '${job.title}' has been marked as Completed`,
            jobId: job._id
        });
    }

    /**
     * Notify freelancer about a new task assignment.
     */
    static async notifyNewTask(freelancerId, task) {
        return sseManager.sendToUser(freelancerId, "DASHBOARD_UPDATE", {
            type: "NEW_TASK",
            message: "New task assigned to you",
            taskId: task._id
        });
    }

    /**
     * Notify job poster about a task status update.
     */
    static async notifyTaskStatusUpdate(jobPosterId, task, status) {
        return sseManager.sendToUser(jobPosterId, "DASHBOARD_UPDATE", {
            type: "TASK_STATUS_UPDATE",
            message: `Task '${task.title}' moved to ${status}`,
            taskId: task._id
        });
    }

    /**
     * Notify freelancer that their task has been approved.
     */
    static async notifyTaskApproved(freelancerId, task) {
        return sseManager.sendToUser(freelancerId, "DASHBOARD_UPDATE", {
            type: "TASK_APPROVED",
            message: `Your task '${task.title}' was approved`,
            taskId: task._id
        });
    }

    /**
     * Notify freelancer that they received a new rating.
     */
    static async notifyNewRating(freelancerId, job, rating) {
        return sseManager.sendToUser(freelancerId, "DASHBOARD_UPDATE", {
            type: "NEW_RATING",
            message: `You received a ${rating}-star rating on job '${job.title}'`,
            jobId: job._id
        });
    }
}

export { NotificationService };
