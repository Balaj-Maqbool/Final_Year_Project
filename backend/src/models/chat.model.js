import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const chatThreadSchema = new Schema(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        jobId: {
            type: Schema.Types.ObjectId,
            ref: "Job",
            required: true
        },
        bidId: {
            type: Schema.Types.ObjectId,
            ref: "Bid",
            required: true
        },
        status: {
            type: String,
            enum: ["active", "archived", "blocked"],
            default: "active"
        },
        blockedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        hiddenFor: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        lastMessage: {
            content: String,
            from: {
                type: Schema.Types.ObjectId,
                ref: "User"
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        },
        unreadCounts: {
            type: Map,
            of: Number,
            default: {}
        }
    },
    { timestamps: true }
);

// Add index for fast participant lookup
chatThreadSchema.index({ participants: 1 });
chatThreadSchema.plugin(mongooseAggregatePaginate);

const messageSchema = new Schema(
    {
        threadId: {
            type: Schema.Types.ObjectId,
            ref: "ChatThread",
            required: true,
            index: true
        },
        from: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        to: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["sent", "delivered", "read"],
            default: "sent"
        },
        replyTo: {
            type: Schema.Types.ObjectId,
            ref: "Message",
            default: null
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        attachments: [
            {
                url: { type: String, required: true },
                publicId: { type: String, required: true },
                resourceType: { type: String, default: "auto" }
            }
        ]
    },
    { timestamps: true }
);

messageSchema.plugin(mongooseAggregatePaginate);

export const ChatThread = mongoose.model("ChatThread", chatThreadSchema);
export const Message = mongoose.model("Message", messageSchema);
