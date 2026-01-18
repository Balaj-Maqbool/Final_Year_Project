import { Router } from "express";
import {
    addRating,
    getFreelancerRatings,
    updateRating
} from "../controllers/rating.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

// POST /api/v1/ratings/:jobId
// Client rates the freelancer for a specific job
router.route("/:jobId")
    .post(addRating);

// PATCH /api/v1/ratings/:ratingId
// Update an existing rating
router.route("/:ratingId")
    .patch(updateRating);

// GET /api/v1/ratings/freelancer/:freelancerId
// Publicly viewable ratings for a freelancer (requires auth as per router.use check, but any role)
router.route("/freelancer/:freelancerId")
    .get(getFreelancerRatings);

export default router;
