import { Router } from "express";
import {
    getClientDashboard,
    getFreelancerDashboard,
    subscribeToDashboardEvents
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

// GET /api/v1/dashboard/client
router.route("/client")
    .get(getClientDashboard);

// GET /api/v1/dashboard/freelancer
router.route("/freelancer")
    .get(getFreelancerDashboard);

// GET /api/v1/dashboard/events (SSE Stream)
router.route("/events")
    .get(subscribeToDashboardEvents);

export default router;
