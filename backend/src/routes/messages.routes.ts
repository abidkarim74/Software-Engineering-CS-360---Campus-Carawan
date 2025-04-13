import { Router } from "express";
import verify from "../middleware/protectRoute.js";
import { getUserConversations, startConversation, getConversation, sendMessage, updateMessages, getUnreadConversationsCount, readMessages, unreadMessagesExist } from "../controllers/messagesControllers.js";


const router = Router();

router.post("/start-conversation", verify, startConversation);
router.post("/send-message/:conversationId", verify, sendMessage)
router.get("/conversations", verify, getUserConversations);
router.get("/conversation/:conversationId", verify, getConversation);
router.put("/update-messages", verify, updateMessages);
router.get("/get-unread-count", verify, getUnreadConversationsCount);
router.put("/:conversationId/read-messages", verify, readMessages);
router.get("/:conversationId/unread-messages-exist", verify, unreadMessagesExist);

export default router;