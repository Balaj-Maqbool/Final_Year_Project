import mongoose, { Schema } from "mongoose";

const ratingSchema = new Schema(
    {
        job_id: {
            type: Schema.Types.ObjectId,
            ref: "Job",
            required: true
        },
        rated_by_user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        rated_user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

ratingSchema.index({ job_id: 1, rated_by_user_id: 1 }, { unique: true });

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

ratingSchema.plugin(mongooseAggregatePaginate);

export const Rating = mongoose.model("Rating", ratingSchema);
