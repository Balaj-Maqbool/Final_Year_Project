import mongoose, { Schema } from "mongoose";

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
        lastMessage: {
            content: String,
            senderId: {
                type: Schema.Types.ObjectId,
                ref: "User"
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    },
    { timestamps: true }
);

// Add index for fast participant lookup
chatThreadSchema.index({ participants: 1 });

const messageSchema = new Schema(
    {
        threadId: {
            type: Schema.Types.ObjectId,
            ref: "ChatThread",
            required: true,
            index: true
        },
        senderId: {
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
        attachments: [
            {
                type: String // Cloudinary URLs
            }
        ]
    },
    { timestamps: true }
);

export const ChatThread = mongoose.model("ChatThread", chatThreadSchema);
export const Message = mongoose.model("Message", messageSchema);
