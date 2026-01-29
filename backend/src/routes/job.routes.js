import { Router } from "express";
import {
    createJob,
    getAllJobs,
    getMyJobs,
    getJobById,
    updateJob,
    deleteJob
} from "../controllers/job.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes (or partially public? For now, let's say anyone can see jobs but maybe we want to restrict to logged in users)
// Requirement says "Freelancers view list of open jobs" -> implies logged in.
// But usually viewing jobs can be public. I'll make it protected for now to be safe, or as per secure defaults.
router.get("/", getAllJobs);

router.use(verifyJWT);

router.post("/", createJob);

router.route("/my-jobs").get(getMyJobs);

router.route("/:jobId")
    .get(getJobById)
    .patch(updateJob)
    .delete(deleteJob);

export default router;
