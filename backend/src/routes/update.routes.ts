import { Response, Request, Router } from "express";
import { updateUserProfilePic, updateVehicleInfo, updateUserInfo, updateRidePrice, removeUserProfilePic} from "../controllers/updateControllers.js";
import verify from "../middleware/protectRoute.js";

const router = Router();

router.put("/uploads-profilepic/:userId", verify, updateUserProfilePic);
router.put("/update-vehicle-info", verify, updateVehicleInfo);
router.put("/remove-profile-pic", verify, removeUserProfilePic);
router.put("/update-user-info", verify, updateUserInfo);
router.put("/:id/update-fare", verify, updateRidePrice);




export default router;