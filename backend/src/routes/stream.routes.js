import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { streamEvents } from "../controllers/stream.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/connect").get(streamEvents);

export default router;
