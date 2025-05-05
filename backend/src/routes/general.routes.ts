import { Router, Response, Request } from "express";
import prisma from "../db/prisma.js";
import verify from "../middleware/protectRoute.js";
import { getUserProfile, getComplains, getSearchedUserResults, getTrendingUsers, createComplain, rateUser } from "../controllers/generalControllers.js";


const router = Router();


router.post("/create-complain", verify, createComplain);
router.get("/get-complains", verify, getComplains);
router.get("/profile/:userId", verify, getUserProfile);
router.post("/search-users", verify, getSearchedUserResults);
router.get("/trending-users", verify, getTrendingUsers);
router.post("/rate-user", verify, rateUser)

router.get("/clean-messages", async (req: Request, res: Response) => {
  try {
    const result = await prisma.message.deleteMany();
    const result2 = await prisma.emailVerification.deleteMany();
    const result5 = await prisma.notification.deleteMany();
    const result6 = await prisma.complain.deleteMany();
    const result4 = await prisma.user.deleteMany();

    res.status(200).json({ message: "Database cleaned successfully"});
  } catch (error) {
    console.error("Error cleaning database:", error);
    res.status(500).json({ error: "Failed to clean database", details: error });
  }
});


export default router;


