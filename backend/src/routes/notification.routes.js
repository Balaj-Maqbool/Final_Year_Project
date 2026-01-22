import { Router } from "express";
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllAsRead,
    deleteNotification
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .get(getUserNotifications);

router.route("/read-all")
    .patch(markAllAsRead);

router.route("/:notificationId/read")
    .patch(markNotificationAsRead);

router.route("/:notificationId")
    .delete(deleteNotification);

export default router;
