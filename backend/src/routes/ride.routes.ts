import { Router } from "express";
import verify from "../middleware/protectRoute.js";
import { getRideRequestPosts, ridePostAcceptRequest, ridePostCreateRequest } from "../controllers/ridesController.js";


const router = Router();


router.post("/send-request",verify, ridePostCreateRequest);
router.post("/accept-request", verify, ridePostAcceptRequest);
router.get("/ride-requests",verify, getRideRequestPosts);


export default router;