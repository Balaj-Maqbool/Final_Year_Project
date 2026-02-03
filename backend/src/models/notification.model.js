import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            enum: [
                "NEW_JOB",
                "NEW_JOB_AVAILABLE",
                "JOB_MATCH",
                "NEW_BID",
                "BID_WITHDRAWN",
                "BID_STATUS_UPDATE",
                "NEW_TASK",
                "TASK_STATUS_UPDATE",
                "TASK_APPROVED",
                "JOB_COMPLETED",
                "NEW_RATING",
                "CHAT",
                "NEW_CHAT_MESSAGE",
                "SYSTEM"
            ],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        relatedId: {
            type: Schema.Types.ObjectId
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

notificationSchema.plugin(mongooseAggregatePaginate);

export const Notification = mongoose.model("Notification", notificationSchema);
