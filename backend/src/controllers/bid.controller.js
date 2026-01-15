import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Bid } from "../models/bid.model.js";
import { Job } from "../models/job.model.js";
import mongoose from "mongoose";

const placeBid = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { bid_amount, message, timeline } = req.body;

    if (req.user.role !== "Freelancer") {
        throw new ApiError(403, "Only Freelancers can place bids");
    }

    if (!bid_amount || !message || !timeline) {
        throw new ApiError(400, "All fields (bid_amount, message, timeline) are required");
    }

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.status !== "Open") {
        throw new ApiError(400, "This job is not open for bidding");
    }

    // Check if user has already bid
    const existingBid = await Bid.findOne({ job_id: jobId, user_id: req.user?._id });
    if (existingBid) {
        throw new ApiError(400, "You have already placed a bid on this job");
    }

    // Restrict job poster from bidding on their own job
    if (job.poster_id.toString() === req.user?._id.toString()) {
        throw new ApiError(403, "You cannot bid on your own job");
    }

    const bid = await Bid.create({
        job_id: jobId,
        user_id: req.user?._id,
        bid_amount,
        message,
        timeline
    });

    return res.status(201).json(
        new ApiResponse(201, bid, "Bid placed successfully")
    );
});

const getJobBids = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    // Validate jobId
    if (!mongoose.isValidObjectId(jobId)) {
        throw new ApiError(400, "Invalid Job ID");
    }

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // Only the job poster should see all bids
    if (job.poster_id.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to view bids for this job");
    }

    const bids = await Bid.aggregate([
        {
            $match: {
                job_id: new mongoose.Types.ObjectId(jobId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "freelancer",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            email: 1,
                            profileImage: 1,
                            rating: 1,
                            skills: 1
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
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, bids, "Bids fetched successfully")
    );
});

// Update bid status (Accept/Reject)
const updateBidStatus = asyncHandler(async (req, res) => {
    const { jobId, bidId } = req.params;
    const { status } = req.body; // "Accepted" or "Rejected"

    if (!["Accepted", "Rejected"].includes(status)) {
        throw new ApiError(400, "Invalid status. Use 'Accepted' or 'Rejected'");
    }

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.poster_id.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to manage bids for this job");
    }

    const bid = await Bid.findById(bidId);
    if (!bid) {
        throw new ApiError(404, "Bid not found");
    }

    // If accepting, ensure job is still open
    if (status === "Accepted" && job.status !== "Open") {
        throw new ApiError(400, "Job is already assigned or completed");
    }

    bid.status = status;
    await bid.save();

    if (status === "Accepted") {
        // Assign freelancer to job and close job
        job.status = "Assigned";
        job.assigned_to = bid.user_id;
        await job.save();

        // Optional: Reject all other pending bids? For now, we leave them or logic can be added here.
    }

    return res.status(200).json(
        new ApiResponse(200, bid, `Bid ${status.toLowerCase()} successfully`)
    );
});

const withdrawBid = asyncHandler(async (req, res) => {
    const { jobId, bidId } = req.params;

    const bid = await Bid.findOne({ _id: bidId, job_id: jobId });

    if (!bid) {
        throw new ApiError(404, "Bid not found");
    }

    if (bid.user_id.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to withdraw this bid");
    }

    if (bid.status !== "Pending") {
        throw new ApiError(400, "Cannot withdraw a bid that has been processed (Accepted/Rejected)");
    }

    await Bid.findByIdAndDelete(bidId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Bid withdrawn successfully")
    );
});

const getMyBids = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }
    if (req.user.role !== "Freelancer") {
        throw new ApiError(403, "Unauthorized to view bids");
    }

    const bids = await Bid.aggregate([
        {
            $match: {
                user_id: req.user._id
            }
        },
        {
            $lookup: {
                from: "jobs",
                localField: "job_id",
                foreignField: "_id",
                as: "job",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            status: 1,
                            poster_id: 1,
                            budget: 1,
                            deadline: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                job: { $first: "$job" }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, bids, "My bids fetched successfully")
    );
});

export {
    placeBid,
    getJobBids,
    updateBidStatus,
    withdrawBid,
    getMyBids
};
