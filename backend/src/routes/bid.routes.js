
import { Router } from "express";
import {
    placeBid,
    getJobBids,
    updateBidStatus,
    withdrawBid,
    getMyBids
} from "../controllers/bid.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router({ mergeParams: true }); // Enable access to params from parent router if nested

router.use(verifyJWT);

// Routes for /api/v1/bids/:jobId/... or /api/v1/jobs/:jobId/bids ??
// Let's decide on the path strategy.
// Strategy A: /api/v1/bids (requires passing jobId in body or params explicitly generally)
// Strategy B: /api/v1/jobs/:jobId/bids (Nesting)
// The user request pattern often implies relationships.
// Let's stick to a clean separate router for bids, but maybe referenced by ID.

// Actually, "placeBid" needs jobId. "getJobBids" needs jobId.
// I'll define routes like:
// POST /:jobId -> place bid
// GET /:jobId -> get all bids for job
// PATCH /:jobId/:bidId/status -> update status

router.route("/my-bids").get(getMyBids);

router.route("/:jobId")
    .post(placeBid)
    .get(getJobBids);

router.route("/:jobId/:bidId")
    .delete(withdrawBid);

router.route("/:jobId/:bidId/status")
    .patch(updateBidStatus);

export default router;
