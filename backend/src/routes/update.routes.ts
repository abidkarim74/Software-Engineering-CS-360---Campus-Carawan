import { Response, Request, Router } from "express";
import { updateUserProfilePic, updateVehicleInfo } from "../controllers/updateControllers.js";
import verify from "../middleware/protectRoute.js";

const router = Router();

router.put("/uploads-profilepic/:userId", verify, updateUserProfilePic);
router.put("/update-vehicle-info", verify, updateVehicleInfo);
// router.put("/remove-profile-pic", verify, removeProfie);

export default router;