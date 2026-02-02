import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
    {
        job_id: {
            type: Schema.Types.ObjectId,
            ref: "Job",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ["To Do", "In Progress", "Done"],
            default: "To Do"
        },
        assigned_user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        is_approved: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

taskSchema.plugin(mongooseAggregatePaginate);

export const Task = mongoose.model("Task", taskSchema);
