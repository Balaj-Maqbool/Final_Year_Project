import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Job } from "../models/job.model.js";

const createJob = asyncHandler(async (req, res) => {
    const { title, description, budget, deadline, category } = req.body;

    if (!title || !description || !budget || !deadline || !category) {
        throw new ApiError(400, "All fields (title, description, budget, deadline, category) are required");
    }

    const job = await Job.create({
        title,
        description,
        budget,
        deadline,
        category,
        poster_id: req.user?._id
    });

    return res.status(201).json(
        new ApiResponse(201, job, "Job posted successfully")
    );
});

const getAllJobs = asyncHandler(async (req, res) => {
    // Optional: Add filtering by category, budget, etc. later
    const jobs = await Job.find({ status: "Open" })
        .populate("poster_id", "fullName email profileImage")
        .sort({ createdAt: -1 });

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

    const job = await Job.findById(jobId).populate("poster_id", "fullName email profileImage");

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    return res.status(200).json(
        new ApiResponse(200, job, "Job fetched successfully")
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

    job.title = title || job.title;
    job.description = description || job.description;
    job.budget = budget || job.budget;
    job.deadline = deadline || job.deadline;
    job.category = category || job.category;
    if (status) job.status = status;

    await job.save();

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
