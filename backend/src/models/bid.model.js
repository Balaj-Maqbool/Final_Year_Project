import mongoose, { Schema } from "mongoose";

const bidSchema = new Schema(
    {
        job_id: {
            type: Schema.Types.ObjectId,
            ref: "Job",
            required: true
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        bid_amount: {
            type: Number,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        timeline: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["Pending", "Accepted", "Rejected"],
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

bidSchema.plugin(mongooseAggregatePaginate);

export const Bid = mongoose.model("Bid", bidSchema);
