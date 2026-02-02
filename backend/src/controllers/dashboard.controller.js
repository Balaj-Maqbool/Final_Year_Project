import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Job } from "../models/job.model.js";
import { Bid } from "../models/bid.model.js";
import { Task } from "../models/task.model.js";
import mongoose from "mongoose";

const getClientDashboard = asyncHandler(async (req, res) => {
    if (req.user.role !== "Client") {
        throw new ApiError(403, "Only Clients can access this dashboard");
    }

    const userId = req.user._id;

    const dashboardData = await Job.aggregate([
        {
            $match: {
                poster_id: userId
            }
        },
        {
            $facet: {

                "jobStats": [
                    {
                        $group: {
                            _id: null,
                            totalJobs: { $sum: 1 },
                            openJobs: {
                                $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] }
                            },
                            assignedJobs: {
                                $sum: { $cond: [{ $eq: ["$status", "Assigned"] }, 1, 0] }
                            },
                            completedJobs: {
                                $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
                            },
                            totalBudgetSpent: {
                                $sum: {
                                    $cond: [
                                        { $in: ["$status", ["Assigned", "Completed"]] },
                                        "$budget",
                                        0
                                    ]
                                }
                            }
                        }
                    }
                ],

                "recentJobs": [
                    { $sort: { createdAt: -1 } },
                    { $limit: 5 },
                    {
                        $project: {
                            title: 1,
                            status: 1,
                            budget: 1,
                            deadline: 1,
                            createdAt: 1
                        }
                    }
                ]
            }
        }
    ]);

    // Separate aggregation for Bids received across all jobs
    const bidStats = await Bid.aggregate([
        {
            $lookup: {
                from: "jobs",
                localField: "job_id",
                foreignField: "_id",
                as: "job"
            }
        },
        {
            $unwind: "$job"
        },
        {
            $match: {
                "job.poster_id": userId
            }
        },
        {
            $group: {
                _id: null,
                totalBidsReceived: { $sum: 1 },
                pendingBids: {
                    $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
                }
            }
        }
    ]);

    const stats = dashboardData[0].jobStats[0] || {
        totalJobs: 0, openJobs: 0, assignedJobs: 0, completedJobs: 0, totalBudgetSpent: 0
    };

    const bids = bidStats[0] || { totalBidsReceived: 0, pendingBids: 0 };

    return res.status(200).json(
        new ApiResponse(200, {
            stats: {
                ...stats,
                ...bids
            },
            recentJobs: dashboardData[0].recentJobs
        }, "Client dashboard data fetched successfully")
    );
});

//////freelancer dashBoard
const getFreelancerDashboard = asyncHandler(async (req, res) => {
    if (req.user.role !== "Freelancer") {
        throw new ApiError(403, "Only Freelancers can access this dashboard");
    }

    const userId = req.user._id;


    const bidStats = await Bid.aggregate([
        {
            $match: {
                user_id: userId
            }
        },
        {
            $facet: {
                "stats": [
                    {
                        $group: {
                            _id: null,
                            totalBids: { $sum: 1 },
                            pendingBids: {
                                $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
                            },
                            acceptedBids: {
                                $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] }
                            },
                            rejectedBids: {
                                $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] }
                            }
                        }
                    }
                ]
            }
        }
    ]);

    const jobStats = await Job.aggregate([
        {
            $match: {
                assigned_to: userId
            }
        },
        {
            $lookup: {
                from: "bids",
                let: { jobId: "$_id", freelancerId: userId },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$job_id", "$$jobId"] },
                                    { $eq: ["$user_id", "$$freelancerId"] },
                                    { $eq: ["$status", "Accepted"] }
                                ]
                            }
                        }
                    },
                    { $project: { bid_amount: 1 } }
                ],
                as: "acceptedBid"
            }
        },
        {
            // Unwind safely (though assigned jobs SHOULD have an accepted bid, hypothetically)
            $unwind: { path: "$acceptedBid", preserveNullAndEmptyArrays: true }
        },
        {
            $facet: {
                "earnings": [
                    {
                        $group: {
                            _id: null,
                            // Use the bid amount if available, otherwise fallback to budget (safety net), or 0
                            totalEarnings: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$status", "Completed"] },
                                        { $ifNull: ["$acceptedBid.bid_amount", "$budget"] },
                                        0
                                    ]
                                }
                            },
                            completedJobsCount: {
                                $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
                            },
                            activeJobsCount: {
                                $sum: { $cond: [{ $eq: ["$status", "Assigned"] }, 1, 0] }
                            }
                        }
                    }
                ],
                "activeJobs": [
                    {
                        $match: { status: "Assigned" }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "poster_id",
                            foreignField: "_id",
                            as: "client",
                            pipeline: [{ $project: { fullName: 1 } }]
                        }
                    },
                    { $addFields: { client: { $first: "$client" } } },
                    {
                        $project: {
                            title: 1,
                            budget: 1, // Still show est budget or maybe show accepted bid? lets keep budget for listing
                            deadline: 1,
                            "client.fullName": 1,
                            "finalPrice": { $ifNull: ["$acceptedBid.bid_amount", "$budget"] } // Helpful to see
                        }
                    }
                ]
            }
        }
    ]);


    const pendingTasks = await Task.aggregate([
        {
            $match: {
                assigned_user_id: userId,
                status: { $ne: "Done" }
            }
        },
        {
            $lookup: {
                from: "jobs",
                localField: "job_id",
                foreignField: "_id",
                as: "job",
                pipeline: [{ $project: { title: 1 } }]
            }
        },
        { $unwind: "$job" },
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
            $project: {
                title: 1,
                status: 1,
                "job.title": 1
            }
        }
    ]);

    const bStats = bidStats[0].stats[0] || { totalBids: 0, pendingBids: 0, acceptedBids: 0, rejectedBids: 0 };
    const jStats = jobStats[0].earnings[0] || { totalEarnings: 0, completedJobsCount: 0, activeJobsCount: 0 };

    return res.status(200).json(
        new ApiResponse(200, {
            stats: {
                ...bStats,
                ...jStats
            },
            activeJobs: jobStats[0].activeJobs,
            pendingTasks: pendingTasks
        }, "Freelancer dashboard data fetched successfully")
    );
});


export {
    getClientDashboard,
    getFreelancerDashboard
};
