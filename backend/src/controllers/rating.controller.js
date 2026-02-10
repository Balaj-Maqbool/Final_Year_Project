import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Rating } from "../models/rating.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { NotificationService } from "../services/notification.service.js";
import { ValidationHelper } from "../utils/validation.utils.js";
import { Task } from "../models/task.model.js";

const addRating = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { rating, comment } = req.body;

    ValidationHelper.validateId(jobId, "Invalid Job ID");

    if (req.user.role !== "Client") {
        throw new ApiError(403, "Only Clients can submit ratings");
    }

    ValidationHelper.validateRange(rating, 1, 5, "Rating");
    ValidationHelper.validateLength(comment, 3, 1000, "Comment");

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.poster_id.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You can only rate freelancers for your own jobs"
        );
    }

    if (job.status === "Open") {
        throw new ApiError(
            400,
            "Cannot rate a freelancer on an Open job. Job must be Assigned or Completed."
        );
    }

    const freelancerId = job.assigned_to;
    if (!freelancerId) {
        throw new ApiError(400, "No freelancer is assigned to this job");
    }

    const existingRating = await Rating.findOne({
        job_id: jobId,
        rated_by_user_id: req.user._id
    });

    if (existingRating) {
        throw new ApiError(
            400,
            "You have already rated the freelancer for this job"
        );
    }

    const newRating = await Rating.create({
        job_id: jobId,
        rated_by_user_id: req.user._id,
        rated_user_id: freelancerId,
        rating,
        comment
    });

    const stats = await Rating.aggregate([
        {
            $match: {
                rated_user_id: new mongoose.Types.ObjectId(freelancerId)
            }
        },
        {
            $group: {
                _id: "$rated_user_id",
                averageRating: { $avg: "$rating" },
                ratingCount: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await User.findByIdAndUpdate(freelancerId, {
            rating: Math.round(stats[0].averageRating * 10) / 10
        });
    }

    if (job.status !== "Completed") {
        // Logic Audit Fix: Check for unapproved tasks before auto-completing
        const unapprovedTasks = await Task.countDocuments({
            job_id: jobId,
            is_approved: { $ne: true }
        });

        if (unapprovedTasks > 0) {
            throw new ApiError(
                400,
                `Cannot submit rating and complete job. There are ${unapprovedTasks} tasks that are not yet approved.`
            );
        }

        job.status = "Completed";
        await job.save();
    }

    await NotificationService.notifyNewRating(freelancerId, job, rating);

    return res
        .status(201)
        .json(new ApiResponse(201, newRating, "Rating submitted successfully"));
});

const getFreelancerRatings = asyncHandler(async (req, res) => {
    const { freelancerId } = req.params;

    ValidationHelper.validateId(freelancerId, "Invalid Freelancer ID");

    const { page = 1, limit = 10 } = req.query;

    const aggregate = Rating.aggregate([
        {
            $match: {
                rated_user_id: new mongoose.Types.ObjectId(freelancerId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "rated_by_user_id",
                foreignField: "_id",
                as: "reviewer",
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
            $unwind: {
                path: "$reviewer",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const ratings = await Rating.aggregatePaginate(aggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, ratings, "Ratings fetched successfully"));
});

const updateRating = asyncHandler(async (req, res) => {
    const { ratingId } = req.params;
    const { rating, comment } = req.body;

    ValidationHelper.validateId(ratingId, "Invalid Rating ID");

    if (ValidationHelper.isEmpty(rating) && ValidationHelper.isEmpty(comment)) {
        throw new ApiError(400, "Provide rating or comment to update");
    }

    const existingRating = await Rating.findById(ratingId);
    if (!existingRating) {
        throw new ApiError(404, "Rating not found");
    }

    if (
        existingRating.rated_by_user_id.toString() !== req.user?._id.toString()
    ) {
        throw new ApiError(403, "You are not authorized to update this rating");
    }

    let shouldUpdateStats = false;

    if (rating !== undefined) {
        ValidationHelper.validateRange(rating, 1, 5, "Rating");
        existingRating.rating = rating;
        shouldUpdateStats = true;
    }

    if (comment !== undefined) {
        ValidationHelper.validateLength(comment, 3, 1000, "Comment");
        existingRating.comment = comment;
    }

    await existingRating.save();

    if (shouldUpdateStats) {
        const stats = await Rating.aggregate([
            {
                $match: {
                    rated_user_id: existingRating.rated_user_id
                }
            },
            {
                $group: {
                    _id: "$rated_user_id",
                    averageRating: { $avg: "$rating" },
                    ratingCount: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            await User.findByIdAndUpdate(existingRating.rated_user_id, {
                rating: Math.round(stats[0].averageRating * 10) / 10
            });
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, existingRating, "Rating updated successfully")
        );
});

export {
    addRating,
    getFreelancerRatings,
    updateRating // exported
};
