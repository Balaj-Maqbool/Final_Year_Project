import { Router } from "express";
import {
    createTask,
    getJobTasks,
    updateTaskStatus,
    approveTask
} from "../controllers/task.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

// Routes relative to /api/v1/tasks

// POST /api/v1/tasks/:jobId -> Create a task for a job (Client)
// GET /api/v1/tasks/:jobId -> Get all tasks for a job (Client/Freelancer of that job)
router.route("/:jobId")
    .post(createTask)
    .get(getJobTasks);

// PATCH /api/v1/tasks/:taskId/status -> Update status (Freelancer)
router.route("/:taskId/status")
    .patch(updateTaskStatus);

// PATCH /api/v1/tasks/:taskId/approve -> Approve task (Client)
router.route("/:taskId/approve")
    .patch(approveTask);

export default router;
