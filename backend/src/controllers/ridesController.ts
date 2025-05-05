import { Request, Response } from "express";
import prisma from "../db/prisma.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

export const ridePostCreateRequest = async (req: Request, res: Response) => {
  const user = req.user;

  if (!req.user?.id || !req.user?.fullname) {
    throw new Error("User ID or fullname is missing");
  }
  const {
    cost,
    pickLocation,
    passengers,
    dropLocation,
    caption,
    time,
    pickCordinate,
    dropCordinate,
  } = req.body;

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentPostAsPoster = await prisma.carpoolRequestPost.findFirst({
      where: {
        posterId: user?.id,
        time: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    const recentPostAsOtherUser = await prisma.carpoolRequestPost.findFirst({
      where: {
        otherId: user?.id,
        isAccepted: true,
        time: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    if (recentPostAsPoster) {
      res.status(400).json({
        error:
          "You've already created a ride request in the last 24 hours. Please wait before creating another.",
      });
      return;
    }

    if (recentPostAsOtherUser) {
      res.status(400).json({
        error:
          "You're already part of an active ride from the last 24 hours. Please complete it first.",
      });
      return;
    }

    const newCost: number = Number(cost);

    const newRidePost = await prisma.carpoolRequestPost.create({
      data: {
        poster: { connect: { id: user?.id } },
        caption,
        dropLocation,
        pickLocation,
        dropCordinate,
        pickCordinate,
        seats: passengers,
        cost: newCost,
        departureTime: time,
      },
    });

    const isDriver = req.user?.driver;

    const notificationReceivers = await prisma.user.findMany({
      where: {
        driver: {
          not: isDriver,
        },
        id: {
          not: req.user.id,
        },
      },
    });

    for (let i = 0; i < notificationReceivers.length; i++) {
      const receiverUser = notificationReceivers[i];

      const notification = await prisma.notification.create({
        data: {
          userId: receiverUser.id,
          message: `${req.user?.fullname} is requesting for a carpool!`,
          read: false,
          time: new Date(),
          notifierId: req.user.id,
        },
      });

      const receiverSocketId = getReceiverSocketId(receiverUser.id);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newNotification", {
          id: notification.id,
          time: notification.time,
          message: notification.message,
          read: notification.read,
          notifier: {
            id: req.user.id,
            fullname: req.user.fullname,
          },
        });
       
      }
    }

    res.status(201).json(newRidePost);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const ridePostAcceptRequest = async (req: Request, res: Response) => {
  const user = req.user;
  const { id } = req.body;
  try {
    const existingAcceptedRide = await prisma.carpoolRequestPost.findFirst({
      where: {
        otherId: user?.id,
        time: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingAcceptedRide) {
      res.status(400).json({
        error:
          "You already have an active ride. You can't accept another ride.",
      });
      return;
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: user?.id },
      select: {
        driver: true,
        fullname: true,
        id: true,
      },
    });

    if (!currentUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const ridePost = await prisma.carpoolRequestPost.findFirst({
      where: { id },
      include: {
        poster: {
          select: {
            driver: true,
            id: true,
          },
        },
      },
    });

    if (!ridePost) {
      res.status(404).json({ error: "Ride request not found" });
      return;
    }

    if (ridePost.posterId === user?.id) {
      res
        .status(403)
        .json({ error: "You cannot accept your own ride request" });
      return;
    }

    if (ridePost.isAccepted) {
      res.status(400).json({ error: "Request already accepted" });
      return;
    }

    const isCurrentUserDriver = currentUser.driver;
    const isPosterDriver = ridePost.poster.driver;

    if (isCurrentUserDriver && isPosterDriver) {
      res.status(400).json({
        error: "As a driver, you can only accept requests from non-drivers",
      });
      return;
    }

    if (!isCurrentUserDriver && !isPosterDriver) {
      res.status(400).json({
        error: "As a non-driver, you can only accept requests from drivers",
      });
      return;
    }

    const updatedRidePost = await prisma.carpoolRequestPost.update({
      where: { id },
      data: {
        otherUser: { connect: { id: user?.id } },
        isAccepted: true,
      },
    });

    const notification = await prisma.notification.create({
      data: {
        userId: ridePost.posterId,
        message: `${currentUser.fullname} has accepted your ride request!`,
        read: false,
        time: new Date(),
        notifierId: currentUser.id,
      },
    });

    const receiverSocketId = getReceiverSocketId(ridePost.posterId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newNotification", {
        id: notification.id,
        time: notification.time,
        message: notification.message,
        read: notification.read,
        notifier: {
          id: currentUser.id,
          fullname: currentUser.fullname,
        },
      });
      
    }

    let otherUserId;
    if (req.user?.id === ridePost.poster.id) {
      otherUserId = ridePost.otherId;
    }

    const userId1 = req.user?.id;
    const userId2 = ridePost.poster.id;

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            users: {
              some: { id: userId1 },
            },
          },
          {
            users: {
              some: { id: userId2 },
            },
          },
        ],
      },
      include: {
        users: true,
      },
    });

    const conversation =
      existingConversation ??
      (await prisma.conversation.create({
        data: {
          name: `New Conversation`,
          users: {
            connect: [{ id: userId1 }, { id: userId2 }],
          },
        },
        include: {
          users: true,
        },
      }));

    const newMessage = await prisma.message.create({
      data: {
        message: ridePost.caption,
        sender: {
          connect: {
            id: ridePost.poster.id,
          },
        },
        conversation: {
          connect: {
            id: conversation.id,
          },
        },
      },
    });
    const receiver = conversation.users.find(
      (user) => user.id !== newMessage.senderId
    );
    const receiverId = receiver?.id || null;

    setImmediate(() => {
      const receiverSocketId = receiverId
        ? getReceiverSocketId(receiverId)
        : null;
      const senderSocketId = getReceiverSocketId(newMessage.senderId);

      if (receiverSocketId)
        io.to(receiverSocketId).emit("newMessage", newMessage);
      if (senderSocketId) io.to(senderSocketId).emit("newMessage", newMessage);
    });

    res.status(200).json(updatedRidePost);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const getRideRequestPosts = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const isCurrentUserDriver = req.user?.driver;
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const rideRequests = await prisma.carpoolRequestPost.findMany({
      where: {
        time: { gte: twentyFourHoursAgo },
        posterId: { not: currentUserId },
        isAccepted: false,
        poster: {
          driver: isCurrentUserDriver ? false : true,
        },
      },
      include: {
        poster: {
          select: {
            id: true,
            username: true,
            fullname: true,
            profilePic: true,
            reviews: true,
            vehicles: true,
            driver: true,
          },
        },
      },
      orderBy: { time: "desc" },
    });

    res.status(200).json(rideRequests);
  } catch (error) {
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const getPendingRideRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json("Unauthenticated User");
      return;
    }

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const pendingRequests = await prisma.carpoolRequestPost.findMany({
      where: {
        posterId: userId,
        time: {
          gte: twentyFourHoursAgo,
        },
      },
      select: {
        id: true,
        otherId: true,
        time: true,
        pickLocation: true,
        dropLocation: true,
        cost: true,
        isAccepted: true,
        departureTime: true,
      },
      orderBy: {
        time: "desc",
      },
    });

    res.status(200).json(pendingRequests);
  } catch (err: any) {
    console.error(err);
    res
      .status(500)
      .json("Something went wrong while fetching pending requests");
  }
};

export const getAcceptedRidesLastWeek = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json("Unauthenticated User");
      return;
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const acceptedRides = await prisma.carpoolRequestPost.findMany({
      where: {
        posterId: userId,
        isAccepted: true,
        time: {
          gte: oneWeekAgo,
        },
      },
      select: {
        id: true,
        otherId: true,
        time: true,
        pickLocation: true,
        dropLocation: true,
        isAccepted: true,
        departureTime: true,
      },
      orderBy: {
        time: "desc",
      },
    });

    res.status(200).json(acceptedRides);
  } catch (error) {
    console.error(error);
    res.status(500).json("Something went wrong while fetching accepted rides");
  }
};

export const getRidePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;

    if (!postId) {
      res.status(400).json("Invalid post ID");
      return;
    }
    const ridePost = await prisma.carpoolRequestPost.findFirst({
      where: {
        id: postId,
      },
      include: {
        poster: {
          select: {
            id: true,
            username: true,
            fullname: true,
            profilePic: true,
            reviews: true,
            vehicles: true,
            driver: true,
          },
        },
      },
    });

    if (!ridePost) {
      res.status(200).json({ ridePost: null });
      return;
    }
    res.status(200).json(ridePost);
  } catch (err: any) {
    res.status(500).json("Something went wrong while fetching the ride data.");
  }
};

export const getUserActiveRide = async (req: Request, res: Response) => {
  try {
    console.log("Came right here...");
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "Unauthorized user!" });
      return;
    }

    const activeRide = await prisma.carpoolRequestPost.findFirst({
      where: {
        OR: [
          {
            posterId: user.id,
            time: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
          {
            otherId: user.id,
            time: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
      include: {
        poster: {
          select: {
            id: true,
            username: true,
            fullname: true,
            profilePic: true,
          },
        },
        otherUser: {
          select: {
            id: true,
            username: true,
            fullname: true,
            profilePic: true,
          },
        },
      },
    });
    if (!activeRide) {
      res.status(404).json({ message: "No active ride found" });
      return;
    }


    res.status(200).json(activeRide);
    return;
  } catch (err: any) {
    console.error("Error fetching active ride:", err);
    res.status(500).json({
      error: "Internal server error! Something went wrong fetching the ride.",
    });
    return;
  }
};

export const cancelRideRequest = async (req: Request, res: Response) => {
  try {
    const rideId = req.body.id;

    if (!rideId) {
      res.status(400).json({ error: "Ride ID is missing!" });
      return;
    }

    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized request!" });
      return;
    }

    const ride = await prisma.carpoolRequestPost.findUnique({
      where: { id: rideId },
    });

    if (!ride) {
      res.status(404).json({ error: "Ride not found!" });
      return;
    }

    if (ride.posterId === userId) {
      await prisma.carpoolRequestPost.delete({
        where: { id: rideId },
      });

      res.status(200).json({ message: "Ride post deleted successfully." });
      return;
    } else {
      await prisma.carpoolRequestPost.update({
        where: { id: rideId },
        data: { otherId: null, isAccepted: false },
      });

      res
        .status(200)
        .json({ message: "You have cancelled the ride successfully." });
      return;
    }
  } catch (err: any) {
    console.error("Cancel ride error:", err);
    res
      .status(500)
      .json({ error: "Internal server error! Could not cancel the ride!" });
    return;
  }
};
