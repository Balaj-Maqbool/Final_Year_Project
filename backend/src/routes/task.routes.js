import { Router } from "express";
import {
    createTask,
    getJobTasks,
    updateTaskStatus,
    approveTask,
    updateTask,
    deleteTask
} from "../controllers/task.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/:jobId").post(createTask).get(getJobTasks);

router.route("/:taskId/status").patch(updateTaskStatus);
router.route("/:taskId/approve").patch(approveTask);
router.route("/:taskId").put(updateTask).delete(deleteTask);

export default router;
