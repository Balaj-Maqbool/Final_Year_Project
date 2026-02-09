import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Bid } from "../models/bid.model.js";
import { Job } from "../models/job.model.js";
import mongoose from "mongoose";
import { NotificationService } from "../services/notification.service.js";
import { ValidationHelper } from "../utils/validation.utils.js";

const placeBid = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { bid_amount, message, timeline } = req.body;

    ValidationHelper.validateId(jobId, "Invalid Job ID");

    if (req.user.role !== "Freelancer") {
        throw new ApiError(403, "Only Freelancers can place bids");
    }

    ValidationHelper.validateRange(bid_amount, 1, null, "Bid Amount");
    ValidationHelper.validateLength(message, 10, 2000, "Message/Proposal");
    ValidationHelper.validateLength(timeline, 2, 100, "Timeline");

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.status !== "Open") {
        throw new ApiError(400, "This job is not open for bidding");
    }

    const existingBid = await Bid.findOne({
        job_id: jobId,
        user_id: req.user?._id
    });

    if (existingBid) {
        throw new ApiError(400, "You have already placed a bid on this job");
    }

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

    await NotificationService.notifyNewBid(job, bid);

    return res.status(201).json(new ApiResponse(201, bid, "Bid placed successfully"));
});

const getJobBids = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    ValidationHelper.validateId(jobId, "Invalid Job ID");

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.poster_id.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to view bids for this job");
    }

    const { page = 1, limit = 10 } = req.query;

    const aggregate = Bid.aggregate([
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

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const bids = await Bid.aggregatePaginate(aggregate, options);

    return res.status(200).json(new ApiResponse(200, bids, "Bids fetched successfully"));
});

const updateBidStatus = asyncHandler(async (req, res) => {
    const { jobId, bidId } = req.params;
    const { status } = req.body;

    ValidationHelper.validateId(jobId, "Invalid Job ID");
    ValidationHelper.validateId(bidId, "Invalid Bid ID");

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

    if (status === "Accepted" && job.status !== "Open") {
        throw new ApiError(400, "Job is already assigned or completed");
    }

    bid.status = status;
    await bid.save();

    if (status === "Accepted") {
        const updatedJob = await Job.findOneAndUpdate(
            { _id: jobId, status: "Open" },
            {
                $set: {
                    status: "Assigned",
                    assigned_to: bid.user_id
                }
            },
            { new: true }
        );

        if (!updatedJob) {
            throw new ApiError(400, "Job is not Open (it may have been assigned to someone else just now)");
        }

        job.status = "Assigned";
        job.assigned_to = bid.user_id;

        const otherBids = await Bid.find({
            job_id: jobId,
            _id: { $ne: bidId },
            status: "Pending"
        });

        if (otherBids.length > 0) {
            await Bid.updateMany({ _id: { $in: otherBids.map((b) => b._id) } }, { $set: { status: "Rejected" } });

            otherBids.forEach(async (otherBid) => {
                try {
                    await NotificationService.notifyBidStatusUpdate(otherBid.user_id, job, "Rejected");
                } catch (err) {
                    console.error(`Failed to notify freelancer ${otherBid.user_id} of rejection`, err);
                }
            });
        }
    }

    await NotificationService.notifyBidStatusUpdate(bid.user_id, job, status);

    return res.status(200).json(new ApiResponse(200, bid, `Bid ${status.toLowerCase()} successfully`));
});

const withdrawBid = asyncHandler(async (req, res) => {
    const { jobId, bidId } = req.params;

    ValidationHelper.validateId(jobId, "Invalid Job ID");
    ValidationHelper.validateId(bidId, "Invalid Bid ID");

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

    try {
        const job = await Job.findById(bid.job_id);
        if (job) {
            await NotificationService.notifyBidWithdrawn(job.poster_id, job._id);
        }
    } catch (error) {
        console.error("Error sending withdrawal notification:", error);
    }

    return res.status(200).json(new ApiResponse(200, {}, "Bid withdrawn successfully"));
});

const getMyBids = asyncHandler(async (req, res) => {
    if (req.user.role !== "Freelancer") {
        throw new ApiError(403, "Unauthorized to view bids");
    }

    const { page = 1, limit = 10 } = req.query;

    const aggregate = Bid.aggregate([
        {
            $match: {
                user_id: new mongoose.Types.ObjectId(req.user._id)
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

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const bids = await Bid.aggregatePaginate(aggregate, options);

    return res.status(200).json(new ApiResponse(200, bids, "My bids fetched successfully"));
});

const updateBid = asyncHandler(async (req, res) => {
    const { bidId } = req.params;
    const { bid_amount, message, timeline } = req.body;

    ValidationHelper.validateId(bidId, "Invalid Bid ID");

    const bid = await Bid.findById(bidId);
    if (!bid) {
        throw new ApiError(404, "Bid not found");
    }

    if (bid.user_id.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this bid");
    }

    if (bid.status !== "Pending") {
        throw new ApiError(400, "Cannot update a bid that has been accepted or rejected");
    }

    if (bid_amount) ValidationHelper.validateRange(bid_amount, 1, null, "Bid Amount");
    if (message) ValidationHelper.validateLength(message, 10, 2000, "Message/Proposal");
    if (timeline) ValidationHelper.validateLength(timeline, 2, 100, "Timeline");

    bid.bid_amount = bid_amount;
    bid.message = message;
    bid.timeline = timeline;

    await bid.save();

    return res.status(200).json(new ApiResponse(200, bid, "Bid updated successfully"));
});
const getMyBidForJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    ValidationHelper.validateId(jobId, "Invalid Job ID");

    const bid = await Bid.findOne({
        job_id: jobId,
        user_id: req.user._id
    });

    if (!bid) {
        return res.status(200).json(new ApiResponse(200, null, "No bid found for this job"));
    }

    return res.status(200).json(new ApiResponse(200, bid, "Bid fetched successfully"));
});

export { placeBid, getJobBids, updateBidStatus, withdrawBid, getMyBids, updateBid, getMyBidForJob };
