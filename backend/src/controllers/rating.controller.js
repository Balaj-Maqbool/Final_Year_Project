import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Rating } from "../models/rating.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { sseManager } from "../streams/SSEManager.js";

const addRating = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { rating, comment } = req.body;

    // 1. Role Check: Only Clients can rate
    if (req.user.role !== "Client") {
        throw new ApiError(403, "Only Clients can submit ratings");
    }

    if (!rating || !comment) {
        throw new ApiError(400, "Rating (1-5) and comment are required");
    }

    if (rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // 2. Authorization: Client must be the Job Poster
    if (job.poster_id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only rate freelancers for your own jobs");
    }

    // 3. Job Status: Should be Assigned or Completed
    if (job.status === "Open") {
        throw new ApiError(400, "Cannot rate a freelancer on an Open job. Job must be Assigned or Completed.");
    }

    // 4. Target User: Must be the assigned freelancer
    const freelancerId = job.assigned_to;
    if (!freelancerId) {
        throw new ApiError(400, "No freelancer is assigned to this job");
    }

    // Check if duplicate rating
    const existingRating = await Rating.findOne({
        job_id: jobId,
        rated_by_user_id: req.user._id
    });

    if (existingRating) {
        throw new ApiError(400, "You have already rated the freelancer for this job");
    }

    // Create Rating
    const newRating = await Rating.create({
        job_id: jobId,
        rated_by_user_id: req.user._id,
        rated_user_id: freelancerId,
        rating,
        comment
    });

    // 5. Update Freelancer's Average Rating
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
            rating: Math.round(stats[0].averageRating * 10) / 10 // Round to 1 decimal
        });
    }

    // Optionally mark job as Completed if not already
    if (job.status !== "Completed") {
        job.status = "Completed";
        await job.save();
    }

    // SSE: Notify User of new Rating
    sseManager.sendToUser(freelancerId, "DASHBOARD_UPDATE", {
        type: "NEW_RATING",
        message: `You received a ${rating}-star rating on job '${job.title}'`,
        jobId: jobId
    });

    return res.status(201).json(
        new ApiResponse(201, newRating, "Rating submitted successfully")
    );
});

const getFreelancerRatings = asyncHandler(async (req, res) => {
    const { freelancerId } = req.params;

    const ratings = await Rating.aggregate([
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
            $unwind: "$reviewer"
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, ratings, "Ratings fetched successfully")
    );
});

const updateRating = asyncHandler(async (req, res) => {
    const { ratingId } = req.params;
    const { rating, comment } = req.body;

    if (!rating && !comment) {
        throw new ApiError(400, "Provide rating or comment to update");
    }

    const existingRating = await Rating.findById(ratingId);
    if (!existingRating) {
        throw new ApiError(404, "Rating not found");
    }

    if (existingRating.rated_by_user_id.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this rating");
    }

    if (rating) {
        if (rating < 1 || rating > 5) {
            throw new ApiError(400, "Rating must be between 1 and 5");
        }
        existingRating.rating = rating;
    }

    if (comment) {
        existingRating.comment = comment;
    }

    await existingRating.save();

    // Recalculate Average if rating changed
    if (rating) {
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

    return res.status(200).json(
        new ApiResponse(200, existingRating, "Rating updated successfully")
    );
});

export {
    addRating,
    getFreelancerRatings,
    updateRating
};
