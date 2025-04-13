import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import prisma from "../db/prisma.js";
import bcrypt from "bcrypt";
import { hashPassword } from "../utils/hashPassword.js";
import { Gender } from "@prisma/client";


export const loginFunc = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    res.status(400).json("Invalid username or password");
    return;
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    res.status(400).json("Invalid username or password");
    return;
  }

  const accessToken = await generateAccessToken(user.username);
  const refreshToken = await generateRefreshToken(user.username);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });


  res.status(200).json({ accessToken });
  return;
  
}


export const signupFunc = async (req: Request, res: Response) => {
  try {
    const { username, email, fullname, gender, password } = req.body;

    let store: any = gender;
    const updatedGender = store.toUpperCase();

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      res.status(400).json({ error: "User with the username already exists" });
      return;
    }
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      res.status(400).json({ error: "Email has already been used!" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultProfilePic = "http://localhost:5000/uploads/general/default.png";

    const newUser = await prisma.user.create({
      data: {
        username,
        fullname,
        gender: updatedGender,
        email,
        password: hashedPassword,
        profilePic: defaultProfilePic, 
      },
    });

    console.log(newUser);

    const accessToken = await generateAccessToken(newUser.username);
    const refreshToken = await generateRefreshToken(newUser.username);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(201).json({ accessToken });
    return;
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};


export const logoutFunc = async (req: Request, res: Response) => {
  console.log(req.url);
  res.clearCookie("refreshToken", { path: "/" });
  res.status(200).json("You logged out successfully.");
  return;
}


export const getAuthenticatedUser = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }
  try {
    const authUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, fullname: true, profilePic: true, driver:true },
    });


    if (!authUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    // console.log(authUser);

    res.json(authUser);
  } catch (error) {
    console.error("Error fetching authenticated user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const refreshTokenFunc = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401).json("You are not authenticated!");
    return;
  }

  try {
    const decodedUser = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;

    if (!decodedUser || typeof decodedUser !== "object" || !decodedUser.id) {
      res.status(403).json("Invalid token payload");
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: decodedUser.id },
    });

    if (!user) {
      res.clearCookie("refreshToken", { path: "/" });
      res.status(403).json("User no longer exists!");
      return;
    }
    const newAccessToken = await generateAccessToken(user.username);
    const newRefreshToken = await generateRefreshToken(user.username);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.json({ accessToken: newAccessToken });
    return;
  } catch (err) {
    console.error("Token verification error:", err);
    res.clearCookie("refreshToken", { path: "/" });
    res.status(403).json("Refresh token is not valid!");
    return;
  }
}