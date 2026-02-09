import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Job } from "../models/job.model.js";
import { NotificationService } from "../services/notification.service.js";
import { ValidationHelper } from "../utils/validation.utils.js";
import mongoose from "mongoose";
import { Bid } from "../models/bid.model.js";
import { ChatThread } from "../models/chat.model.js";
import { Task } from "../models/task.model.js";

const createJob = asyncHandler(async (req, res) => {
    const { title, description, budget, deadline, category, required_skills } = req.body;

    if (req.user.role !== "Client") {
        throw new ApiError(403, "Only Clients can post jobs");
    }

    if (
        ValidationHelper.isEmpty(title) ||
        ValidationHelper.isEmpty(description) ||
        ValidationHelper.isEmpty(budget) ||
        ValidationHelper.isEmpty(deadline) ||
        ValidationHelper.isEmpty(category)
    ) {
        throw new ApiError(400, "All fields (title, description, budget, deadline, category) are required");
    }

    if (new Date(deadline) < new Date()) {
        throw new ApiError(400, "Deadline must be in the future");
    }

    // Logic Audit Fix: Input Boundaries
    ValidationHelper.validateLength(title, 10, 100, "Title");
    ValidationHelper.validateLength(description, 50, 5000, "Description");
    ValidationHelper.validateRange(budget, 1, 1000000, "Budget");

    // Manual check for skills as requested
    if (required_skills && required_skills.length > 20) throw new ApiError(400, "Max 20 skills allowed");

    const job = await Job.create({
        title,
        description,
        budget,
        deadline,
        category,
        required_skills: required_skills || [],
        poster_id: req.user?._id
    });

    await NotificationService.notifyNewJob(job);

    return res.status(201).json(new ApiResponse(201, job, "Job posted successfully"));
});

const getAllJobs = asyncHandler(async (req, res) => {
    const { search, category, minBudget, maxBudget, page = 1, limit = 10 } = req.query;

    const matchStage = {
        status: "Open"
    };

    if (!ValidationHelper.isEmpty(search)) {
        matchStage.title = { $regex: search, $options: "i" };
    }

    if (!ValidationHelper.isEmpty(category)) {
        matchStage.category = category;
    }

    if (!ValidationHelper.isEmpty(minBudget) || !ValidationHelper.isEmpty(maxBudget)) {
        matchStage.budget = {};
        if (minBudget) matchStage.budget.$gte = parseInt(minBudget);
        if (maxBudget) matchStage.budget.$lte = parseInt(maxBudget);
    }

    const aggregate = Job.aggregate([
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

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const jobs = await Job.aggregatePaginate(aggregate, options);

    return res.status(200).json(new ApiResponse(200, jobs, "Jobs fetched successfully"));
});

const getMyJobs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const aggregate = Job.aggregate([{ $match: { poster_id: req.user._id } }, { $sort: { createdAt: -1 } }]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const jobs = await Job.aggregatePaginate(aggregate, options);

    return res.status(200).json(new ApiResponse(200, jobs, "My jobs fetched successfully"));
});

const getJobById = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    ValidationHelper.validateId(jobId, "Invalid Job ID");

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

    return res.status(200).json(new ApiResponse(200, job[0], "Job fetched successfully"));
});

const updateJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { title, description, budget, deadline, category, status } = req.body;

    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.poster_id.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this job");
    }

    if (job.status === "Completed") {
        throw new ApiError(400, "Job is already Completed. No further updates allowed.");
    }

    if (job.status === "Assigned" && status === "Open") {
        throw new ApiError(400, "Cannot revert an Assigned job to Open status.");
    }

    if (status === "Assigned") {
        throw new ApiError(400, "Cannot manually set status to Assigned. Please accept a bid to assign a freelancer.");
    }

    if (status === "Completed") {
        const unapprovedTasks = await Task.countDocuments({
            job_id: jobId,
            is_approved: { $ne: true }
        });

        if (unapprovedTasks > 0) {
            throw new ApiError(
                400,
                `Cannot complete job. There are ${unapprovedTasks} tasks that are not yet approved by you.`
            );
        }
    }

    // Logic Audit Fix: Input Boundaries for Update
    if (title) ValidationHelper.validateLength(title, 10, 100, "Title");
    if (description) ValidationHelper.validateLength(description, 50, 5000, "Description");
    if (budget) ValidationHelper.validateRange(budget, 1, 1000000, "Budget");

    job.title = title || job.title;
    job.description = description || job.description;
    job.budget = budget || job.budget;
    job.deadline = deadline || job.deadline;
    job.category = category || job.category;
    if (status) job.status = status;

    await job.save();

    if (job.status === "Completed" && job.assigned_to) {
        await NotificationService.notifyJobCompleted(job.assigned_to, job);
    }

    return res.status(200).json(new ApiResponse(200, job, "Job updated successfully"));
});

const deleteJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(404, "Job not found or does not exist anymore");
    }

    if (job.poster_id.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this job");
    }

    if (job.status === "Assigned") {
        throw new ApiError(
            400,
            "Cannot delete an assigned job. Please close or cancel it first to notify the freelancer."
        );
    }

    if (job.status === "Completed") {
        throw new ApiError(400, "Cannot delete a completed job. It is part of the work history.");
    }

    // 1. Delete all Bids on this job
    await Bid.deleteMany({ job_id: jobId });

    // 2. Delete all Chat Threads related to this job
    await ChatThread.deleteMany({ jobId: jobId });

    await Job.findByIdAndDelete(jobId);

    return res.status(200).json(new ApiResponse(200, {}, "Job deleted successfully"));
});

export { createJob, getAllJobs, getMyJobs, getJobById, updateJob, deleteJob };
