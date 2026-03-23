import { Router } from "express";
import {
    createJob,
    getAllJobs,
    getMyJobs,
    getJobById,
    updateJob,
    deleteJob,
    requestPaymentRelease
} from "../controllers/job.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/", createJob);
router.get("/", getAllJobs);
router.get("/my-jobs", getMyJobs);
router.get("/:jobId", getJobById);

router.patch("/:jobId", updateJob);
router.delete("/:jobId", deleteJob);

router.post("/:jobId/request-payment", requestPaymentRelease);

export default router;
