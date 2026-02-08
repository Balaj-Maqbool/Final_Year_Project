import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Task } from "../models/task.model.js";
import { Job } from "../models/job.model.js";
import { NotificationService } from "../services/notification.service.js";
import { ValidationHelper } from "../utils/validation.utils.js";

const createTask = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { title, description } = req.body;

    ValidationHelper.validateId(jobId, "Invalid Job ID");

    ValidationHelper.validateLength(title, 3, 100, "Task Title");
    if (description) ValidationHelper.validateLength(description, 0, 1000, "Task Description");

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.poster_id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the job poster can create tasks");
    }

    if (job.status !== "Assigned" || !job.assigned_to) {
        throw new ApiError(400, "Job must be assigned to a freelancer before creating tasks");
    }

    const task = await Task.create({
        job_id: jobId,
        title,
        description,
        assigned_user_id: job.assigned_to
    });

    await NotificationService.notifyNewTask(job.assigned_to, task);

    return res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
});

const getJobTasks = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    ValidationHelper.validateId(jobId, "Invalid Job ID");

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    const isPoster = job.poster_id.toString() === req.user._id.toString();
    const isFreelancer = job.assigned_to?.toString() === req.user._id.toString();

    if (!isPoster && !isFreelancer) {
        throw new ApiError(403, "You are not authorized to view tasks for this job");
    }

    const { page = 1, limit = 10 } = req.query;

    const aggregate = Task.aggregate([
        { $match: { job_id: new mongoose.Types.ObjectId(jobId) } },
        { $sort: { createdAt: 1 } }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const tasks = await Task.aggregatePaginate(aggregate, options);

    return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

const updateTaskStatus = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;

    ValidationHelper.validateId(taskId, "Invalid Task ID");

    if (!["To Do", "In Progress", "Done"].includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (task.assigned_user_id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the assigned freelancer can update task status");
    }

    if (task.is_approved) {
        throw new ApiError(400, "Cannot change status of an approved task");
    }

    task.status = status;
    await task.save();

    const job = await Job.findById(task.job_id);

    if (job) {
        await NotificationService.notifyTaskStatusUpdate(job.poster_id, task, status);
    }

    return res.status(200).json(new ApiResponse(200, task, "Task status updated successfully"));
});

const approveTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    ValidationHelper.validateId(taskId, "Invalid Task ID");

    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    const job = await Job.findById(task.job_id);
    if (!job) {
        throw new ApiError(404, "Associated Job not found");
    }

    if (job.poster_id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the job poster can approve tasks");
    }

    if (task.status !== "Done") {
        throw new ApiError(400, "Task must be marked as Done by freelancer before approval");
    }

    task.is_approved = true;
    await task.save();

    await NotificationService.notifyTaskApproved(task.assigned_user_id, task);

    return res.status(200).json(new ApiResponse(200, task, "Task approved successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { title, description } = req.body;

    ValidationHelper.validateId(taskId, "Invalid Task ID");

    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    const job = await Job.findById(task.job_id);
    if (!job) {
        throw new ApiError(404, "Associated Job not found");
    }

    if (job.poster_id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the job poster can update tasks");
    }

    if (task.is_approved) {
        throw new ApiError(400, "Cannot update an approved task");
    }

    if (title) {
        ValidationHelper.validateLength(title, 3, 100, "Task Title");
        task.title = title;
    }
    if (description) {
        ValidationHelper.validateLength(description, 0, 1000, "Task Description");
        task.description = description;
    }

    await task.save();

    return res.status(200).json(new ApiResponse(200, task, "Task details updated successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    ValidationHelper.validateId(taskId, "Invalid Task ID");

    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    const job = await Job.findById(task.job_id);
    if (!job) {
        throw new ApiError(404, "Associated Job not found");
    }

    if (job.poster_id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the job poster can delete tasks");
    }

    if (task.is_approved) {
        throw new ApiError(400, "Cannot delete an approved task. Please unapprove it first if necessary.");
    }

    await Task.findByIdAndDelete(taskId);

    return res.status(200).json(new ApiResponse(200, {}, "Task deleted successfully"));
});

export { createTask, getJobTasks, updateTaskStatus, approveTask, updateTask, deleteTask };
