import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    initializeChat,
    getMyThreads,
    getThreadMessages,
    deleteMessage,
    deleteThread,
    blockThread,
    unblockThread
} from "../controllers/chat.controller.js";

const router = Router();

// Apply auth middleware to all chat routes
router.use(verifyJWT);

// Chat Management
router.post("/start", initializeChat); // Start a new chat (Lazy init)
router.get("/", getMyThreads); // Get all active threads
router.route("/:threadId")
    .delete(deleteThread); // Hide/Delete thread for me

// Messages
router.get("/:threadId/messages", getThreadMessages); // Get messages (with pagination)
router.delete("/messages/:messageId", deleteMessage); // Soft delete message

// Blocking
router.post("/:threadId/block", blockThread);
router.post("/:threadId/unblock", unblockThread);

export default router;
