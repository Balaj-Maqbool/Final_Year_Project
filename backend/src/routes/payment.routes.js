import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { RateLimitManager } from "../middlewares/rateLimiter.middleware.js";
import {
    createCheckoutSession,
    getWalletBalance,
    requestWithdrawal
} from "../controllers/payment.controller.js";

const router = Router();

router.use(verifyJWT);

router.post(
    "/checkout/session/:jobId",
    RateLimitManager.apiPayments(),
    createCheckoutSession
);

router.get("/wallet", RateLimitManager.apiPayments(), getWalletBalance);

router.post("/withdraw", RateLimitManager.apiPayments(), requestWithdrawal);

export default router;
