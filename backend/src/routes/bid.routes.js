
import { Router } from "express";
import {
    placeBid,
    getJobBids,
    updateBidStatus,
    withdrawBid,
    getMyBids,
    updateBid,
    getMyBidForJob
} from "../controllers/bid.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router({ mergeParams: true }); // Enable access to params from parent router if nested

router.use(verifyJWT);

// Routes for bid management

router.route("/my-bids").get(getMyBids);

router.route("/job/:jobId/my-bid").get(getMyBidForJob); // Check if I already bid

router.route("/:jobId")
    .post(placeBid)
    .get(getJobBids);

router.route("/:jobId/:bidId")
    .delete(withdrawBid);

router.route("/:bidId")
    .patch(updateBid); // Update Bid (General)

router.route("/:jobId/:bidId/status")
    .patch(updateBidStatus);

export default router;
