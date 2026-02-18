import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    initializeChat,
    getMyThreads,
    getThreadMessages,
    deleteMessage,
    deleteThread,
    blockThread,
    unblockThread,
    markMessagesAsRead,
    sendMessage
} from "../controllers/chat.controller.js";

const router = Router();

router.use(verifyJWT);

router.post("/start/:bidId", initializeChat);
router.get("/", getMyThreads);
router.route("/:threadId").delete(deleteThread);
 
router.get("/:threadId/messages", getThreadMessages);
router.post("/:threadId/messages", sendMessage);
router.delete("/messages/:messageId", deleteMessage);
router.patch("/:threadId/read", markMessagesAsRead);

router.post("/:threadId/block", blockThread);
router.post("/:threadId/unblock", unblockThread);

export default router;
