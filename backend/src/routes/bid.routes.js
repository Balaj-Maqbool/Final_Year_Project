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

const router = Router({ mergeParams: true });

router.use(verifyJWT);





// Routes for specific static paths MUST keep before dynamic /:jobId
router.route("/my-bids").get(getMyBids);
router.route("/my/:jobId").get(getMyBidForJob);

router.route("/job/:jobId/my-bid").get(getMyBidForJob);

router.route("/:jobId")
    .post(placeBid)
    .get(getJobBids);

router.route("/bid/:bidId")
    .put(updateBid);

router.route("/:jobId/:bidId")
    .delete(withdrawBid);

router.route("/:bidId").patch(updateBid);

router.route("/:jobId/:bidId/status").patch(updateBidStatus);

export default router;
