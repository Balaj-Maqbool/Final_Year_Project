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


router.get("/", getAllJobs);

router.use(verifyJWT);

router.post("/", createJob);

router.route("/my-jobs").get(getMyJobs);

router.route("/:jobId")
    .get(getJobById)
    .patch(updateJob)
    .delete(deleteJob);

export default router;
