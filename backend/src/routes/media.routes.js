import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { generateUploadSignature } from "../controllers/media.controller.js";
import { RateLimitManager } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/config", RateLimitManager.apiMedia(), generateUploadSignature);

export default router;
