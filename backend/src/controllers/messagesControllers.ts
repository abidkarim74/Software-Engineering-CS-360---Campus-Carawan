import { Request, Response } from "express";
import prisma from "../db/prisma.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { error } from "console";
import { checkForInappropriateContent } from "../utils/geminAIClient.js";

export const getUserConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found!" });
      return;
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        users: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            seen: true,
            message: true,
            senderId: true,
            createdAt: true, 
          },
        },
      },
    });

    const sortedConversations = conversations.sort((a, b) => {
      const aTime = a.messages[0]?.createdAt ?? new Date(0);
      const bTime = b.messages[0]?.createdAt ?? new Date(0);
      return bTime.getTime() - aTime.getTime();
    });

    res.json({ conversations: sortedConversations });
    return;
  } catch (err: any) {
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

export const getConversation = async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.conversationId;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: { sender: true },
        },
        users: true,
      },
    });

    if (!conversation) {
      res.status(404).json({ error: "Conversation not found!" });
      return;
    }

    res.json(conversation);
    return;
  } catch (err: any) {
    console.error("Error fetching conversation:", err);
    res.status(500).json({ error: "Internal server error!" });
    return;
  }
};

export const startConversation = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const otherUserId = req.user?.id;

    if (!otherUserId) {
      res.status(401).json({ error: "You are not authenticated!" });
      return;
    }
    if (!userId) {
      res.status(400).json({ error: "User ID is required!" });
      return;
    }
    if (userId === otherUserId) {
      res
        .status(400)
        .json({ error: "You cannot start a conversation with yourself!" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "User not found!" });
      return;
    }

    const existingConversations = await prisma.conversation.findMany({
      where: {
        AND: [
          { users: { some: { id: userId } } },
          { users: { some: { id: otherUserId } } },
        ],
      },
      include: { users: true },
    });

    const existingConversation = existingConversations.find(
      (conv) => conv.users.length === 2
    );

    if (existingConversation) {
      res.json(existingConversation);
      return;
    }
    const newConversation = await prisma.conversation.create({
      data: {
        name: "",
        users: {
          connect: [{ id: userId }, { id: otherUserId }],
        },
      },
      include: { users: true },
    });

    res.status(201).json(newConversation);
  } catch (err) {
    console.error("Error starting conversation:", err);
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.conversationId;
    const senderId = req.user?.id;

    if (!senderId) {
      res.status(401).json({ error: "You are not authenticated!" });
      return;
    }
    if (!conversationId) {
      res.status(400).json({ error: "No conversation ID provided!" });
      return;
    }

    const { message, currentDateTime, id } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message text is required!" });
      return;
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { users: { select: { id: true } } },
    });

    if (!conversation) {
      res.status(404).json({ error: "Conversation not found!" });
      return;
    }

    const receiver = conversation.users.find((user) => user.id !== senderId);
    const receiverId = receiver?.id || null;

    const [newMessage] = await prisma.$transaction([
      prisma.message.create({
        data: {
          id,
          message,
          sender: { connect: { id: senderId } },
          conversation: { connect: { id: conversationId } },
          createdAt: currentDateTime,
          editedAt: currentDateTime,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              fullname: true,
              profilePic: true,
            },
          },
          conversation: {
            select: {
              id: true,
            },
          },
        },
      }),
    ]);

    setImmediate(() => {
      const receiverSocketId = receiverId
        ? getReceiverSocketId(receiverId)
        : null;
      const senderSocketId = getReceiverSocketId(senderId);

      if (receiverSocketId)
        io.to(receiverSocketId).emit("newMessage", newMessage);
      if (senderSocketId) io.to(senderSocketId).emit("newMessage", newMessage);
    });

    res.status(201).json(newMessage);
  } catch (err: any) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const updateMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user?.id;

    if (!conversationId || !userId) {
      res.status(400).json({ error: "Conversation or User ID not provided!" });
      return;
    }

    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        seen: false,
        senderId: {
          not: userId,
        },
      },
      data: {
        seen: true,
      },
    });

    res.status(200).json({ message: "Successfully updated messages!" });
  } catch (err: any) {
    res.status(500).json("Error updating the messages.");
  }
};

export const getUnreadConversationsCount = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const userId = req.user.id;
    const conversations = await prisma.conversation.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
        messages: {
          some: {
            seen: false,
            sender: {
              id: {
                not: userId,
              },
            },
          },
        },
      },
    });
    let conversationIds: string[] = [];

    conversations.map((conversation) => {
      conversationIds.push(conversation.id);
    });

    res.status(200).json({ count: conversations.length, ids: conversationIds });
  } catch (err: any) {
    res.status(500).json("Error occured!");
  }
};

export const readMessages = async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.conversationId;
    const userId = req.user?.id;

    if (!conversationId) {
      res.status(400).json("Invalid conversation Id");
      return;
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        users: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!conversation) {
      res
        .status(404)
        .json("Conversation not found or you're not a participant");
      return;
    }

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: {
          not: userId,
        },
        seen: false,
      },
      data: {
        seen: true,
      },
    });
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json("Something went wrong reading the messages!");
  }
};

export const unreadMessagesExist = async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.conversationId;

    if (!conversationId) {
      res.status(400).json("Invalid conversation Id");
      return;
    }

    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json("Unauthorized");
      return;
    }

    const unreadMessages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
        senderId: {
          not: userId,
        },
        seen: false,
      },
    });

    let found: boolean = false;
    if (unreadMessages.length > 0) {
      found = true;
    }
    res.status(200).json({ unread: found });
    return;
  } catch (err: any) {
    console.error(err);
    res.status(500).json("Something went wrong checking unread messages!");
  }
};


export const filterMessages = async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.conversationId;

    if (!conversationId) {
      res.status(403).json({ error: "Conversation ID not found!" });
      return;
    }

    const messagesToFilter = await prisma.message.findMany({
      where: {
        conversationId,
        senderId: req.user?.id,
        clean: false,
      },
      select: {
        id: true,
        message: true,
      },
    });


    if (messagesToFilter.length === 0) {
      res.status(200).json({ clean: true });
      return;
    }

    const messages = messagesToFilter.map((msg) => msg.message);
    const hasInappropriateContent = await checkForInappropriateContent(
      messages
    );

    if (hasInappropriateContent === "no") {
      await prisma.message.updateMany({
        where: {
          id: { in: messagesToFilter.map((msg) => msg.id) },
        },
        data: { clean: true },
      });
    }

    if (hasInappropriateContent === "yes") {
      const updatedUser = await prisma.user.update({
        where: { id: req.user?.id },
        data: { warnings: { increment: 1 } },
        select: {
          id: true,
          warnings: true,
          isSuspended: true,
        },
      });

      if (updatedUser.warnings >= 3 && !updatedUser.isSuspended) {
        await prisma.user.update({
          where: { id: req.user?.id },
          data: { isSuspended: true },
        });
      }

      await prisma.message.deleteMany({
        where: {
          id: { in: messagesToFilter.map((msg) => msg.id) },
        },
      });

      res.status(200).json({
        clean: false,
      });
      return;
    }

    res.status(200).json({ clean: true });
  } catch (err: any) {
    res.status(500).json({
      error:
        "Internal server error! Something went wrong while filtering the messages!",
    });
    return;
  }
};

