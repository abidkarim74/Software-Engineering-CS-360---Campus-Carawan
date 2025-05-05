import { Router } from "express";
import verify from "../middleware/protectRoute.js";
import { getAcceptedRidesLastWeek, getPendingRideRequests, getRidePost, getRideRequestPosts, ridePostAcceptRequest, ridePostCreateRequest, getUserActiveRide, cancelRideRequest} from "../controllers/ridesController.js";


const router = Router();


router.post("/send-request",verify, ridePostCreateRequest);
router.post("/accept-request", verify, ridePostAcceptRequest);
router.get("/ride-requests", verify, getRideRequestPosts);
router.get("/pending-rides", verify, getPendingRideRequests);
router.get("/weekly-history", verify, getAcceptedRidesLastWeek);
router.get("/active-ride", verify, getUserActiveRide);
router.post("/cancel-ride", verify, cancelRideRequest)
router.get("/:postId", verify, getRidePost);


export default router;