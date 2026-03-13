import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { RateLimitManager } from "../middlewares/rateLimiter.middleware.js";
import {
    createCheckoutSession,
    getWalletBalance,
    requestWithdrawal
} from "../controllers/payment.controller.js";

const router = Router();

// Apply JWT authentication to all these routes (Client/Freelancer actions)
router.use(verifyJWT);

// Create a Stripe checkout session for a specific job
router.post(
    "/checkout/session/:jobId",
    RateLimitManager.apiPayments(),
    createCheckoutSession
);

// Get current wallet balance (Freelaner/Client)
router.get("/wallet", RateLimitManager.apiPayments(), getWalletBalance);

// Request a withdrawal from pseudo-escrow (Freelancer only)
router.post("/withdraw", RateLimitManager.apiPayments(), requestWithdrawal);

export default router;
