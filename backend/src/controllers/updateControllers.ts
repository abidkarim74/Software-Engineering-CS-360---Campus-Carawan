import { Response, Request } from "express";
import prisma from "../db/prisma.js";


export const updateUserProfilePic = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { profilePic } = req.body;

    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePic,
      },
    });

    res.status(200).json(user);
    return;
  } catch (err: any) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error uploading profile picture" });
    return;
  }
};


export const removeUserProfilePic = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized request!" });
      return;
    }

    const defaultImageUrl = "http://127.0.0.1:5000/uploads/general/default.png";

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        profilePic: defaultImageUrl
      }
    });

    res.status(200).json("Image removed successfully");


  } catch (err: any) {
    res.status(500).json({ error: "Internal server error! Something went wrong while deleting the profile photo" });
    
  }
}




export const updateVehicleInfo = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    
    const userId = req.user?.id;
    const color = data.color;
    const name = data.name;
    const vehiclePic = data.vehiclePic;
    const model = data.model;
    const type = data.type;
    const numberPlate = data.numberPlate;
    console.log("Vehicle: ", vehiclePic);

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        userId: userId
      }
    });

    const baseData = {
      name,
      type: type || 'FOURWHEEL', 
      numberPlate: numberPlate || '', 
      model: model || '',
      color: color || '',
    };

    if (existingVehicle) {
      const updatedVehicle = await prisma.vehicle.update({
        where: { id: existingVehicle.id },
        data: {
          ...baseData,
          vehiclePics: vehiclePic 
        }
      });
      
      res.status(200).json(updatedVehicle);
      return;
    } else {
      const newVehicle = await prisma.vehicle.create({
        data: {
          ...baseData,
          userId,
          vehiclePics: vehiclePic
        }
      });

      res.status(201).json(newVehicle);
      return;
    }
  } catch (err: any) {
    res.status(500).json({ error: "Error updating the vehicle info!" });
  }
}


export const updateUserInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { fullname, driver, type, phone } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const driverBool = driver === true || driver === 'true' || driver === 'yes';

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullname,
        phone,
        driver: driverBool,
        type
      },
    });

    res.status(200).json(updatedUser);
  } catch (err: any) {
    res.status(500).json({ error: "Error updating user information" });
  }
};



export const updateRidePrice = async (req: Request, res: Response) => {
  try {
    const rideId = req.params.id;
    const newFare = req.body.fare;

    if (!rideId) {
      res.status(400).json({ error: "Ride ID is required." });
      return;
    }

    if (newFare === undefined || typeof newFare !== "number") {
      res.status(400).json({ error: "A valid new fare must be provided." });
      return;
    }

    const ride = await prisma.carpoolRequestPost.findFirst({
      where: {
        id: rideId,
        posterId: req.user?.id,
      },
    });

    if (!ride) {
      res.status(403).json({ error: "You cannot update someone else's ride or ride not found." });
      return;
    }

    const updatedRide = await prisma.carpoolRequestPost.update({
      where: { id: rideId },
      data: { cost: newFare },
    });

    res.status(200).json({ message: "Fare updated successfully", ride: updatedRide });
  } catch (err: any) {
    res.status(500).json({ error: "An error occurred while updating the ride fare." });
  }
};