import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { sseManager } from "../streams/SSEManager.js";

import { Task } from "../models/task.model.js";

const createJob = asyncHandler(async (req, res) => {
    const { title, description, budget, deadline, category, required_skills } = req.body;

    if (req.user.role !== "Client") {
        throw new ApiError(403, "Only Clients can post jobs");
    }

    if (!title || !description || !budget || !deadline || !category) {
        throw new ApiError(400, "All fields (title, description, budget, deadline, category) are required");
    }

    const job = await Job.create({
        title,
        description,
        budget,
        deadline,
        category,
        required_skills: required_skills || [],
        poster_id: req.user?._id
    });

    sseManager.broadcast("NEW_JOB_AVAILABLE", {
        message: "New Job Posted",
        job
    }, "Freelancer");

    if (required_skills && required_skills.length > 0) {
        try {
            const matchedFreelancers = await User.find({
                role: "Freelancer",
                skills: { $in: required_skills }
            }).select("_id");

            matchedFreelancers.forEach(user => {
                sseManager.sendToUser(user._id, "DASHBOARD_UPDATE", {
                    type: "JOB_MATCH",
                    message: `New job matches your skills: ${title}`,
                    jobId: job._id
                });
            });
        } catch (error) {
            console.error("Error sending skill match notifications:", error);
        }
    }

    return res.status(201).json(
        new ApiResponse(201, job, "Job posted successfully")
    );
});

const getAllJobs = asyncHandler(async (req, res) => {
    const { search, category, minBudget, maxBudget } = req.query;

    const matchStage = {
        status: "Open"
    };

    if (search) {
        matchStage.title = { $regex: search, $options: "i" };
    }

    if (category) {
        matchStage.category = category;
    }

    if (minBudget || maxBudget) {
        matchStage.budget = {};
        if (minBudget) matchStage.budget.$gte = parseInt(minBudget);
        if (maxBudget) matchStage.budget.$lte = parseInt(maxBudget);
    }

    const jobs = await Job.aggregate([
        {
            $match: matchStage
        },
        {
            $lookup: {
                from: "users",
                localField: "poster_id",
                foreignField: "_id",
                as: "poster",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            email: 1,
                            profileImage: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                poster: { $first: "$poster" }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, jobs, "Jobs fetched successfully")
    );
});

const getMyJobs = asyncHandler(async (req, res) => {
    const jobs = await Job.find({ poster_id: req.user?._id })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, jobs, "My jobs fetched successfully")
    );
});

const getJobById = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    // Validate jobId format if needed or trust mongoose to cast, but aggregate needs ObjectId casting usually if passing string
    // However, findById casts automatically. Aggregate does not.
    // We need mongoose.Types.ObjectId

    // Check if valid ObjectId
    if (!mongoose.isValidObjectId(jobId)) {
        throw new ApiError(400, "Invalid Job ID");
    }

    const job = await Job.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(jobId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "poster_id",
                foreignField: "_id",
                as: "poster",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            email: 1,
                            profileImage: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                poster: { $first: "$poster" }
            }
        }
    ]);

    if (!job?.length) {
        throw new ApiError(404, "Job not found");
    }

    return res.status(200).json(
        new ApiResponse(200, job[0], "Job fetched successfully")
    );
});

const updateJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { title, description, budget, deadline, category, status } = req.body;

    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // Ensure only the poster can update
    if (job.poster_id.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this job");
    }

    // Critical Business Rule: Limits on updating Assigned/Completed jobs

    // 1. If currently Completed, it's final. Partition logic: Status cannot change from Completed.
    if (job.status === "Completed") {
        throw new ApiError(400, "Job is already Completed. No further updates allowed.");
    }

    // 2. If currently Assigned, allow move to Completed, but BLOCK revert to Open.
    if (job.status === "Assigned" && status === "Open") {
        throw new ApiError(400, "Cannot revert an Assigned job to Open status.");
    }

    // 3. New Rule: ALL tasks must be APPROVED by Client before marking job as Completed
    if (status === "Completed") {
        // We check if there are any tasks where is_approved is NOT true
        const unapprovedTasks = await Task.countDocuments({
            job_id: jobId,
            is_approved: { $ne: true }
        });

        if (unapprovedTasks > 0) {
            throw new ApiError(400, `Cannot complete job. There are ${unapprovedTasks} tasks that are not yet approved by you.`);
        }
    }

    job.title = title || job.title;
    job.description = description || job.description;
    job.budget = budget || job.budget;
    job.deadline = deadline || job.deadline;
    job.category = category || job.category;
    if (status) job.status = status;

    await job.save();

    // SSE: Notify Freelancer if job is completed
    if (job.status === "Completed" && job.assigned_to) {
        sseManager.sendToUser(job.assigned_to, "DASHBOARD_UPDATE", {
            type: "JOB_COMPLETED",
            message: `Job '${job.title}' has been marked as Completed`,
            jobId: job._id
        });
    }

    return res.status(200).json(
        new ApiResponse(200, job, "Job updated successfully")
    );
});

const deleteJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.poster_id.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this job");
    }

    await Job.findByIdAndDelete(jobId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Job deleted successfully")
    );
});

export {
    createJob,
    getAllJobs,
    getMyJobs,
    getJobById,
    updateJob,
    deleteJob
};
