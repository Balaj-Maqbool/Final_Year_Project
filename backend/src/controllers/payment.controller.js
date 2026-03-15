import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Job } from "../models/job.model.js";
import { Payment } from "../models/payment.model.js";
import { User } from "../models/user.model.js";
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from "../constants.js";
import Stripe from "stripe";
import { ValidationHelper } from "../utils/validation.utils.js";
import { NotificationService } from "../services/notification.service.js";

const stripe = new Stripe(STRIPE_SECRET_KEY);

const PLATFORM_FEE_PERCENTAGE = 0.1;

const createCheckoutSession = asyncHandler(async (req, res) => {
    if (req.user.role !== "Client") {
        throw new ApiError(403, "Only Clients can initiate payments.");
    }

    const { jobId } = req.params;
    ValidationHelper.validateId(jobId, "Invalid Job ID");

    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(404, "Job not found.");
    }

    if (job.poster_id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only fund your own jobs.");
    }

    if (!job.assigned_to) {
        throw new ApiError(
            400,
            "Cannot fund a job that is not assigned to a freelancer."
        );
    }

    if (job.contract_status !== "Pending") {
        throw new ApiError(
            400,
            `Cannot fund this job. Current status is ${job.contract_status}.`
        );
    }

    const amount = job.agreed_price > 0 ? job.agreed_price : job.budget;

    if (amount <= 0) {
        throw new ApiError(400, "Invalid job budget/price.");
    }

    const amountInCents = Math.round(amount * 100);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        client_reference_id: req.user._id.toString(),
        metadata: {
            jobId: job._id.toString(),
            clientId: req.user._id.toString(),
            freelancerId: job.assigned_to.toString()
        },
        line_items: [
            {
                price_data: {
                    currency: job.currency || "usd",
                    product_data: {
                        name: `Escrow Fund for Job: ${job.title}`,
                        description: `Funds will be held in platform pseudo-escrow until milestone completion. Currency: ${job.currency.toUpperCase()}`
                    },
                    unit_amount: amountInCents
                },
                quantity: 1
            }
        ],
        success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`
    });

    await NotificationService.notifyPaymentInitiated(req.user._id, job);

    console.log("stripe session created", session);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                sessionId: session.id,
                url: session.url
            },
            "Checkout session created successfully."
        )
    );
});

const stripeWebhook = async (req, res) => {
    const payload = req.body;
    const sig = req.headers["stripe-signature"];

    let event;

    try {
        if (!STRIPE_WEBHOOK_SECRET) {
            console.warn(
                "⚠️ STRIPE_WEBHOOK_SECRET is missing. Webhooks cannot be verified yet."
            );
            throw new Error("Missing Webhook Secret");
        }

        event = stripe.webhooks.constructEvent(
            payload,
            sig,
            STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const jobId = session.metadata.jobId;
        const clientId = session.metadata.clientId;
        const freelancerId = session.metadata.freelancerId;

        const amountPaid = session.amount_total / 100;

        try {
            const client = await User.findById(clientId);
            const freelancer = await User.findById(freelancerId);
            const job = await Job.findById(jobId);

            if (client && freelancer && job) {
                const platformFee = amountPaid * PLATFORM_FEE_PERCENTAGE;
                const freelancerEarnings = amountPaid - platformFee;

                client.totalSpent = (client.totalSpent || 0) + amountPaid;
                await client.save({ validateBeforeSave: false });

                freelancer.escrowBalance =
                    (freelancer.escrowBalance || 0) + freelancerEarnings;
                await freelancer.save({ validateBeforeSave: false });

                job.contract_status = "Active";
                await job.save();

                await Payment.create({
                    user: client._id,
                    job: job._id,
                    amount: amountPaid,
                    currency: session.currency || job.currency || "usd",
                    type: "deposit",
                    status: "completed",
                    stripeSessionId: session.id,
                    stripePaymentIntentId: session.payment_intent
                });

                await NotificationService.notifyPaymentSuccess(
                    clientId,
                    freelancerId,
                    job,
                    amountPaid,
                    session.currency || job.currency
                );

                console.log(
                    `✅ Payment successful for Job: ${jobId}. Escrow funded.`
                );
            }
        } catch (dbError) {
            console.error(
                "Error processing successful payment in DB:",
                dbError
            );
        }
    }

    res.json({ received: true });
};

const getWalletBalance = asyncHandler(async (req, res) => {
    const user = req.user;

    const transactionHistory = await Payment.find({ user: req.user._id })
        .populate({
            path: "job",
            select: "title status poster_id",
            populate: {
                path: "poster_id",
                select: "fullName avatar"
            }
        })
        .sort({ createdAt: -1 })
        .limit(20);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                wallet: user,
                transactions: transactionHistory
            },
            "Wallet balance and transaction history retrieved successfully."
        )
    );
});

const requestWithdrawal = asyncHandler(async (req, res) => {
    if (req.user.role !== "Freelancer") {
        throw new ApiError(403, "Only Freelancers can request withdrawals.");
    }

    const { amount } = req.body;

    ValidationHelper.validateRange(amount, 1, 100000, "Withdrawal amount");

    const freelancer = await User.findById(req.user._id);

    if (freelancer.availableBalance < amount) {
        throw new ApiError(400, "Insufficient funds in wallet.");
    }

    freelancer.availableBalance -= amount;
    await freelancer.save({ validateBeforeSave: false });

    const withdrawalRecord = await Payment.create({
        user: freelancer._id,
        amount: amount,
        type: "withdrawal",
        status: "pending"
    });

    await NotificationService.notifyWithdrawalRequested(
        freelancer._id,
        amount,
        "usd"
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                withdrawalRecord,
                "Withdrawal request submitted successfully. Admin will process it shortly."
            )
        );
});

export {
    createCheckoutSession,
    stripeWebhook,
    getWalletBalance,
    requestWithdrawal //exported
};
