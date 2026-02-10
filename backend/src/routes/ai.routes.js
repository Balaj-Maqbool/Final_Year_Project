import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    generateJobDetails,
    policeUserProfile,
    generateProposal,
    generateTaskBreakdown
} from "../controllers/ai.controller.js";

import { RateLimitManager } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router.use(verifyJWT);
router.use(RateLimitManager.apiAI());

router.post("/job-architect", generateJobDetails);
router.post("/profile-polisher", policeUserProfile);
router.post("/proposal-generator", generateProposal);
router.post("/task-breakdown", generateTaskBreakdown);

export default router;
