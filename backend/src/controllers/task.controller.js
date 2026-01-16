import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Task } from "../models/task.model.js";
import { Job } from "../models/job.model.js";
import mongoose from "mongoose";

const createTask = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { title, description } = req.body;

    if (!title) {
        throw new ApiError(400, "Task title is required");
    }

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // Only Client (Job Poster) can create tasks
    if (job.poster_id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the job poster can create tasks");
    }

    // Ensure job is assigned so we know who the task is for
    if (job.status !== "Assigned" || !job.assigned_to) {
        throw new ApiError(400, "Job must be assigned to a freelancer before creating tasks");
    }

    const task = await Task.create({
        job_id: jobId,
        title,
        description,
        assigned_user_id: job.assigned_to
    });

    return res.status(201).json(
        new ApiResponse(201, task, "Task created successfully")
    );
});

const getJobTasks = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    // Validate Job exists
    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // Auth check: User must be either the Poster or the Assigned Freelancer
    const isPoster = job.poster_id.toString() === req.user._id.toString();
    const isFreelancer = job.assigned_to?.toString() === req.user._id.toString();

    if (!isPoster && !isFreelancer) {
        throw new ApiError(403, "You are not authorized to view tasks for this job");
    }

    const tasks = await Task.find({ job_id: jobId }).sort({ createdAt: 1 });

    return res.status(200).json(
        new ApiResponse(200, tasks, "Tasks fetched successfully")
    );
});

const updateTaskStatus = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!["To Do", "In Progress", "Done"].includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Only assigned freelancer can update status
    if (task.assigned_user_id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the assigned freelancer can update task status");
    }

    // If task is already approved, status shouldn't change? (Optional business rule)
    if (task.is_approved) {
        throw new ApiError(400, "Cannot change status of an approved task");
    }

    task.status = status;
    await task.save();

    return res.status(200).json(
        new ApiResponse(200, task, "Task status updated successfully")
    );
});

const approveTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Must search for job to verify ownership
    const job = await Job.findById(task.job_id);
    if (!job) {
        throw new ApiError(404, "Associated Job not found");
    }

    // Only Client (Poster) can approve
    if (job.poster_id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the job poster can approve tasks");
    }

    if (task.status !== "Done") {
        throw new ApiError(400, "Task must be marked as Done by freelancer before approval");
    }

    task.is_approved = true;
    await task.save();

    return res.status(200).json(
        new ApiResponse(200, task, "Task approved successfully")
    );
});

export {
    createTask,
    getJobTasks,
    updateTaskStatus,
    approveTask
};
