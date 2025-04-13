import { Response, Request } from "express";
import prisma from "../db/prisma.js";
import { error } from "console";


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
      type: type || 'FOURWHEEL', // default value if not provided
      numberPlate: numberPlate || '', // empty string if not provided
      model: model || '',
      color: color || '',
    };

    if (existingVehicle) {
      const updatedVehicle = await prisma.vehicle.update({
        where: { id: existingVehicle.id },
        data: {
          ...baseData,
          vehiclePics: vehiclePic 
            ? [...(existingVehicle.vehiclePics || []), vehiclePic]
            : existingVehicle.vehiclePics
        }
      });
      console.log("This one: ", updatedVehicle);
      
      res.status(200).json(updatedVehicle);
      return;
    } else {
      const newVehicle = await prisma.vehicle.create({
        data: {
          ...baseData,
          userId,
          vehiclePics: vehiclePic ? [vehiclePic] : []
        }
      });

      console.log(newVehicle);
      res.status(201).json(newVehicle);
      return;
    }
  } catch (err: any) {
    console.error("Error: ", err);
    res.status(500).json({ error: "Error updating the vehicle info!" });
  }
}




