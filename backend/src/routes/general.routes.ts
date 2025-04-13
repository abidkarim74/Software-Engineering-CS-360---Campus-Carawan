import { Router, Response, Request } from "express";
import prisma from "../db/prisma.js";
import verify from "../middleware/protectRoute.js";
import { getUserProfile } from "../controllers/generalControllers.js";


const router = Router();



router.get("/profile/:userId", verify, getUserProfile);

router.get("/clean-messages", async (req: Request, res: Response) => {
  try {
    const result = await prisma.message.deleteMany();
    // const result2 = await prisma.notification.deleteMany();
    // const result4 = await prisma.carpoolRequestPost.deleteMany();

    console.log("Deleted messages:", result); 
    res.status(200).json({ message: "Database cleaned successfully", deletedCount: result.count });
  } catch (error) {
    console.error("Error cleaning database:", error);
    res.status(500).json({ error: "Failed to clean database", details: error });
  }
});


export default router;


