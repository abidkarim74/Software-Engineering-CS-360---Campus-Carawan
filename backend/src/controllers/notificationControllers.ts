import { Request, Response } from "express";
import prisma from "../db/prisma.js";
import { getReceiverSocketId, io } from "../socket/socket.js";



export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const userId = req.user.id;

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        time: { gte: twentyFourHoursAgo },
      },
      select: {
        id: true,
        time: true,
        message: true, 
        read: true,
        notifier: {
          select: { id: true, username: true, fullname: true, profilePic: true },
        },
      },
      orderBy: { time: "desc" },
    });

    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  } 
}


export const createNotification = async (req: Request, res: Response) => {
  try {
    const { userId, message } = req.body;
    const notifierId = req.user?.id;

    if (!userId || !notifierId || !message) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const notification = await prisma.notification.create({
      data: {
        userId,
        notifierId,
        message,
      },
    });


    const user = await prisma.user.findUnique({
      where: { id: notifierId },
      select: {
        id: true,
        fullname: true,
        username: true,
        profilePic:true
      },
    });
    if (!user) {
      res.status(400).json({ error: "Invalid user ID!" });
      return;
    }

    const receiverSocketId = getReceiverSocketId(userId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newNotification", {
        id: notification.id,
        time: notification.time,
        message: notification.message,
        read: notification.read,
        notifier:user
      });
    } else {
      console.log(`⚠️ User ${notifierId} is offline, notification saved.`);
    }

    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Internal server error!" });
  }
}

export const readNotifications = async (req: Request, res: Response) => {
  try {
    const updateData = req.body;
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json("Unauthorized");
      return;
    }

    const unreadNotifications = await prisma.notification.findMany({
      where: {
        userId: userId,
        read: false
      },
    });

    for (let i = 0; i < unreadNotifications.length; i++) {
      const updatedNotification = await prisma.notification.update({
        where: {
          id: unreadNotifications[i].id,
        },
        data: {
          read: true,
        }, 
      });   
    }

    res.status(200).json({"success": true});
    
  } catch (err: any) {
    console.error("Error updating notification:", err);
    res.status(500).json({ error: "Internal server error!" });
  }
};


export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const userId = req.user.id;

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        time: { gte: twentyFourHoursAgo },
        read:false
      },
    });
    res.status(200).json({"count": notifications.length});

  } catch (err: any) {
    res.status(500).json({ error: "Internal server error!" });
  }
}

