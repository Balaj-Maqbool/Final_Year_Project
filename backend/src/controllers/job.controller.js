import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Job } from "../models/job.model.js";
import { NotificationService } from "../services/notification.service.js";
import { ValidationHelper } from "../utils/validation.utils.js";
import mongoose from "mongoose";
import { Bid } from "../models/bid.model.js";
import { ChatThread } from "../models/chat.model.js";
import { Task } from "../models/task.model.js";

const createJob = asyncHandler(async (req, res) => {
    const { title, description, budget, deadline, category, required_skills } =
        req.body;

    if (req.user.role !== "Client") {
        throw new ApiError(403, `Only Clients can post jobs. You are: ${req.user.role}`);
    }

    if (
        ValidationHelper.isEmpty(deadline) ||
        ValidationHelper.isEmpty(category)
    ) {
        throw new ApiError(400, "All fields (deadline, category) are required");
    }

    try {
        const job = await Job.create({
            title,
            description,
            budget,
            deadline,
            category,
            required_skills: required_skills || [],
            poster_id: req.user?._id
        });
    if (new Date(deadline) < new Date()) {
        throw new ApiError(400, "Deadline must be in the future");
    }

    ValidationHelper.validateLength(title, 10, 100, "Title");
    ValidationHelper.validateLength(description, 50, 5000, "Description");
    ValidationHelper.validateRange(budget, 1, 1000000, "Budget");

    if (required_skills && required_skills.length > 20)
        throw new ApiError(400, "Max 20 skills allowed");

  

    await NotificationService.notifyNewJob(job);

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
    } catch (error) {
        console.error("Error creating job:", error);
        throw new ApiError(500, "Internal Server Error while creating job: " + error.message);
    }

});

const getAllJobs = asyncHandler(async (req, res) => {
    const {
        search,
        category,
        minBudget,
        maxBudget,
        page = 1,
        limit = 10
    } = req.query;

    const matchStage = {
        status: "Open"
    };

    if (!ValidationHelper.isEmpty(search)) {
        matchStage.title = { $regex: search, $options: "i" };
    }

    if (!ValidationHelper.isEmpty(category)) {
        matchStage.category = category;
    }

    if (
        !ValidationHelper.isEmpty(minBudget) ||
        !ValidationHelper.isEmpty(maxBudget)
    ) {
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

    return res
        .status(200)
        .json(new ApiResponse(200, jobs, "Jobs fetched successfully"));
});

const getMyJobs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const aggregate = Job.aggregate([
        { $match: { poster_id: req.user._id } },
        {
            $lookup: {
                from: "users",
                localField: "assigned_to",
                foreignField: "_id",
                as: "freelancer",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            profileImage: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                freelancer: { $first: "$freelancer" }
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const jobs = await Job.aggregatePaginate(aggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, jobs, "My jobs fetched successfully"));
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
        },
        {
            $lookup: {
                from: "users",
                localField: "assigned_to",
                foreignField: "_id",
                as: "freelancer",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            profileImage: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                freelancer: { $first: "$freelancer" }
            }
        }
    ]);

    if (!job?.length) {
        throw new ApiError(404, "Job not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, job[0], "Job fetched successfully"));
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
        throw new ApiError(
            400,
            "Job is already Completed. No further updates allowed."
        );
    }

    if (job.status === "Assigned" && status === "Open") {
        throw new ApiError(
            400,
            "Cannot revert an Assigned job to Open status."
        );
    }

    if (status === "Assigned") {
        throw new ApiError(
            400,
            "Cannot manually set status to Assigned. Please accept a bid to assign a freelancer."
        );
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

    if (
        ["Assigned", "Completed"].includes(job.status) &&
        budget &&
        budget !== job.budget
    ) {
        throw new ApiError(
            400,
            "Cannot modify budget for an assigned or completed job. The contract price is fixed."
        );
    }

    if (title !== undefined) {
        ValidationHelper.validateLength(title, 10, 100, "Title");
        job.title = title;
    }
    if (description !== undefined) {
        ValidationHelper.validateLength(description, 50, 5000, "Description");
        job.description = description;
    }
    if (budget !== undefined) {
        ValidationHelper.validateRange(budget, 1, 1000000, "Budget");
        job.budget = budget;
    }
    if (deadline !== undefined) {
        if (ValidationHelper.isEmpty(deadline))
            throw new ApiError(400, "Deadline is required");
        if (new Date(deadline) < new Date())
            throw new ApiError(400, "Deadline must be in the future");
        job.deadline = deadline;
    }
    if (category !== undefined) {
        if (ValidationHelper.isEmpty(category))
            throw new ApiError(400, "Category is required");
        job.category = category;
    }
    if (status === "Closed" || (status === "Completed" && job.status !== "Completed" && job.assigned_to)) {
        // Release funds if they haven't been released yet
        if (job.contract_status === "Active" && job.assigned_to) {
            const amountToRelease = job.agreed_price > 0 ? job.agreed_price : job.budget;
            const platformFee = amountToRelease * 0.10;
            const freelancerEarnings = amountToRelease - platformFee;

            const freelancer = await User.findById(job.assigned_to);
            if (freelancer) {
                freelancer.escrowBalance = Math.max(0, (freelancer.escrowBalance || 0) - freelancerEarnings); 
                freelancer.availableBalance = (freelancer.availableBalance || 0) + freelancerEarnings;
                freelancer.totalEarned = (freelancer.totalEarned || 0) + freelancerEarnings;
                await freelancer.save({ validateBeforeSave: false });
                console.log(`💰 Escrow Released: $${freelancerEarnings} moved to available balance.`);
            }
        }
        // Set contract to Fulfilled
        job.contract_status = "Fulfilled";
    }

    if (status !== undefined) {
        if (!["Open", "Assigned", "Completed", "Closed"].includes(status)) {
            throw new ApiError(400, "Invalid status");
        }
        job.status = status;
    }

    // Save job after all checks and potential escrow logic
    await job.save();

    if (job.status === "Completed" && job.assigned_to) {
        await NotificationService.notifyJobCompleted(job.assigned_to, job);
        await NotificationService.notifyJobClosed(req.user._id, job);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, job, "Job updated successfully"));
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
        throw new ApiError(
            400,
            "Cannot delete a completed job. It is part of the work history."
        );
    }

    await Bid.deleteMany({ job_id: jobId });
    await ChatThread.deleteMany({ jobId: jobId });
    await Job.findByIdAndDelete(jobId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Job deleted successfully"));
});

export {
    createJob,
    getAllJobs,
    getMyJobs,
    getJobById,
    updateJob,
    deleteJob // exported
};
