import mongoose, { Schema } from "mongoose";

const jobSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        budget: {
            type: Number,
            required: true,
            min: [1, "Budget must be at least 1"]
        },
        deadline: {
            type: Date,
            required: true
        },
        category: {
            type: String,
            required: true,
            index: true
        },
        required_skills: {
            type: [String],
            default: []
        },
        status: {
            type: String,
            enum: ["Open", "Assigned", "Completed"],
            default: "Open",
            index: true
        },
        poster_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        assigned_to: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true
        },
        agreed_price: {
            type: Number,
            default: 0
        },
        contract_status: {
            type: String,
            enum: ["Pending", "Active", "Fulfilled"],
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

jobSchema.plugin(mongooseAggregatePaginate);

export const Job = mongoose.model("Job", jobSchema);
