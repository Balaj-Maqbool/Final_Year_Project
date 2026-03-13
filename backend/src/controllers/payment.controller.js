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

// Initialize Stripe with the secret key from environment
const stripe = new Stripe(STRIPE_SECRET_KEY);

const PLATFORM_FEE_PERCENTAGE = 0.10; // 10%

/**
 * @desc Create a Stripe Checkout Session for a Client paying for a Job
 * @route POST /api/v1/payments/create-checkout-session/:jobId
 * @access Protected (Client only)
 */
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
        throw new ApiError(400, "Cannot fund a job that is not assigned to a freelancer.");
    }

    if (job.contract_status !== "Pending") {
        throw new ApiError(400, `Cannot fund this job. Current status is ${job.contract_status}.`);
    }

    // Determine the amount to charge (in USD for test mode simplicity)
    const amount = job.agreed_price > 0 ? job.agreed_price : job.budget;

    if (amount <= 0) {
        throw new ApiError(400, "Invalid job budget/price.");
    }

    // Stripe expects amount in cents
    const amountInCents = Math.round(amount * 100);

    // Create the session
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
        // Using standard success/cancel URLs, these would usually point to your Frontend
        success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`
    });

    // We don't save the Payment in DB as "completed" until the webhook fires.
    // We can save a "pending" record if we want, but it's simpler to just return the URL for now.
    
    // Notify the client that payment session is created
    await NotificationService.notifyPaymentInitiated(req.user._id, job);

    console.log("stripe session created", session);

    return res.status(200).json(
        new ApiResponse(200, {
            sessionId: session.id,
            url: session.url
        }, "Checkout session created successfully.")
    );
});

/**
 * @desc Handle Stripe Webhook to confirm payment and perform pseudo-escrow DB logic
 * @route POST /api/v1/payments/webhook
 * @access Public (Protected by Stripe Signature)
 */
const stripeWebhook = async (req, res) => {
    const payload = req.body; // THIS MUST BE RAW BUFFER, handled in app.js
    const sig = req.headers["stripe-signature"];

    let event;

    try {
        if (!STRIPE_WEBHOOK_SECRET) {
            console.warn("⚠️ STRIPE_WEBHOOK_SECRET is missing. Webhooks cannot be verified yet.");
            // For local development, if you don't have the secret yet, we might have to bypass
            // But for production, this should throw.
            throw new Error("Missing Webhook Secret");
        }

        event = stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const jobId = session.metadata.jobId;
        const clientId = session.metadata.clientId;
        const freelancerId = session.metadata.freelancerId;

        const amountPaid = session.amount_total / 100; // convert from cents

        try {
            // 1. Fetch Users & Job
            const client = await User.findById(clientId);
            const freelancer = await User.findById(freelancerId);
            const job = await Job.findById(jobId);

            if (client && freelancer && job) {
                // 2. Perform Pseudo-Escrow Math
                const platformFee = amountPaid * PLATFORM_FEE_PERCENTAGE;
                const freelancerEarnings = amountPaid - platformFee;

                // 3. Update Client (totalSpent)
                client.totalSpent = (client.totalSpent || 0) + amountPaid;
                await client.save({ validateBeforeSave: false });

                // 4. Update Freelancer (escrowBalance) - Funds are locked here until job completion
                freelancer.escrowBalance = (freelancer.escrowBalance || 0) + freelancerEarnings;
                await freelancer.save({ validateBeforeSave: false });

                // 5. Update Job Status
                job.contract_status = "Active"; // Or whichever status indicates it's funded and work can begin
                await job.save();

                // 6. Record the Payment in our DB
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

                // 7. Notify both parties
                await NotificationService.notifyPaymentSuccess(
                    clientId,
                    freelancerId,
                    job,
                    amountPaid,
                    session.currency || job.currency
                );

                console.log(`✅ Payment successful for Job: ${jobId}. Escrow funded.`);
            }
        } catch (dbError) {
            console.error("Error processing successful payment in DB:", dbError);
            // Ideally notify admin or retry mechanism
        }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
};

/**
 * @desc Get the current user's wallet balance
 * @route GET /api/v1/payments/wallet
 * @access Protected
 */
const getWalletBalance = asyncHandler(async (req, res) => {
    // Both Freelancers and Clients can view their financial stats
    // Note: req.user is already populated by verifyJWT middleware with full user details
    const user = req.user;

    // Fetch the transaction ledger (history of deposits, withdrawals)
    const transactionHistory = await Payment.find({ user: req.user._id })
        .populate({
            path: "job",
            select: "title status poster_id",
            populate: {
                path: "poster_id",
                select: "fullName avatar"
            }
        })
        .sort({ createdAt: -1 }) // Newest first
        .limit(20); // Limit to recent 20 for performance, can add pagination later

    return res.status(200).json(
        new ApiResponse(200, {
            wallet: user,
            transactions: transactionHistory
        }, "Wallet balance and transaction history retrieved successfully.")
    );
});

/**
 * @desc Request a withdrawal from pseudo-escrow to bank
 * @route POST /api/v1/payments/withdraw
 * @access Protected (Freelancer only)
 */
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

    // Deduct the requested amount from the active balance
    freelancer.availableBalance -= amount;
    await freelancer.save({ validateBeforeSave: false });

    // Record the withdrawal request (status: pending, requires admin manual payout)
    const withdrawalRecord = await Payment.create({
        user: freelancer._id,
        amount: amount,
        type: "withdrawal",
        status: "pending" // Admin will change this to 'completed' once they wire the money
    });

    // Notify freelancer that withdrawal request is submitted (defaulting to USD for now as wallet is generic)
    await NotificationService.notifyWithdrawalRequested(freelancer._id, amount, "usd");

    return res.status(200).json(
        new ApiResponse(200, withdrawalRecord, "Withdrawal request submitted successfully. Admin will process it shortly.")
    );
});

export {
    createCheckoutSession,
    stripeWebhook,
    getWalletBalance,
    requestWithdrawal
};
