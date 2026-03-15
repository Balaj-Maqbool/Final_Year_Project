import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        job: {
            type: Schema.Types.ObjectId,
            ref: "Job"
        },
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: "usd"
        },
        type: {
            type: String,
            enum: ["deposit", "withdrawal", "platform_fee"],
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed", "refunded"],
            default: "pending"
        },
        stripeSessionId: {
            type: String
        },
        stripePaymentIntentId: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

paymentSchema.index({ user: 1 });
paymentSchema.index({ job: 1 });

export const Payment = mongoose.model("Payment", paymentSchema);
