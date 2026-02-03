import { Router } from "express";
import { getClientDashboard, getFreelancerDashboard } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/client").get(getClientDashboard);

router.route("/freelancer").get(getFreelancerDashboard);

export default router;
