import { Router } from "express";
import {
    addRating,
    getFreelancerRatings,
    updateRating
} from "../controllers/rating.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/:jobId").post(addRating);

router.route("/:ratingId").patch(updateRating);

router.route("/freelancer/:freelancerId").get(getFreelancerRatings);

export default router;
