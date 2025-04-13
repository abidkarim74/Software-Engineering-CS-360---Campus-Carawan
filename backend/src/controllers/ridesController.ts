import { Request, Response } from "express";
import prisma from "../db/prisma.js";


export const ridePostCreateRequest = async (req:Request, res:Response) => {
  const user = req.user; 
  const { cost, pickLocation, dropLocation, caption } = req.body;

  const newCost: number = Number(cost);

  console.log(cost, pickLocation, dropLocation, caption);

  try {
    const newRidePost = await prisma.carpoolRequestPost.create({
      data: {
        poster: { connect: { id: user?.id } }, 
        caption,
        dropLocation,
        pickLocation,
        cost:newCost
      },
    });



    res.status(201).json(newRidePost); 
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Internal server error!" });
  }
}

export const ridePostAcceptRequest = async (req: Request, res: Response) => {
  const user = req.user; 
  const { id } = req.body;

  try {
    const driver = await prisma.user.findUnique({
      where: { id: user?.id },
      select: {driver:true}
    })

    if (!driver || !driver?.driver) {
      console.log("OK");
      res.status(400).json({ message: "To accept the request you need to be a driver" });
      return
    }
    const ridePost = await prisma.carpoolRequestPost.findFirst({
      where: { id },
    });

    if (!ridePost) {
      res.status(404).json({ error: "Ride request not found" });
      return;
    }
    if (ridePost.posterId === user?.id) {
      res.status(403).json({ error: "You cannot accept your own ride request" });
      return;
    }

    if (ridePost.isAccepted) {
      res.status(400).json({ error: "Request already accepted" });
      return;
    }

    const updatedRidePost = await prisma.carpoolRequestPost.update({
      where: { id },
      data: {
        otherUser: { connect: { id: user?.id } }, 
        isAccepted: true,
      },
    });

    res.status(200).json(updatedRidePost);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Internal server error!" });
  }
}

export const getRideRequestPosts = async (req: Request, res: Response) => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const rideRequests = await prisma.carpoolRequestPost.findMany({
      where: {
        time: { gte: twentyFourHoursAgo }, 
      },
      include: {
        poster: { select: { id: true, username: true, fullname: true, profilePic:true, reviews:true, vehicles:true } }, 
      },
      orderBy: { time: "desc" }, 
    });
    console.log(rideRequests[0]);

    res.status(200).json(rideRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error!" });
  }
}