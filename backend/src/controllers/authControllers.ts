import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import prisma from "../db/prisma.js";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "../services/email.js";



export const loginFunc = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    res.status(400).json({ error: "Invalid username or password" });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    res.status(400).json({ error: "Invalid password" });
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
};

export const signupFunc = async (req: Request, res: Response) => {
  try {
    const { username, email, fullname, gender, password } = req.body;

    if (!email.endsWith("@lums.edu.pk")) {
      res.status(400).json({
        error: "Only LUMS email addresses (@lums.edu.pk) are allowed",
      });
      return;
    }

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
    const defaultProfilePic =
      "http://localhost:5000/uploads/general/default.png";

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

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_SALT_ROUNDS = 10;

export const sendOTP = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const hashed = await bcrypt.hash(otp, OTP_SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.emailVerification.upsert({
    where: { email },
    create: { email, otp: hashed, expiresAt },
    update: { otp: hashed, expiresAt },
  });

  const ok = await sendVerificationEmail(email, otp);
  if (!ok) {
    res.status(500).json({ error: "Failed to send OTP email" });
    return;
  }

  console.log(`🔔 OTP ${otp} for ${email} saved & mailed.`);
  res.json({ message: "OTP sent successfully" });
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json({ error: "Email and OTP required" });
    return;
  }

  const record = await prisma.emailVerification.findUnique({
    where: { email },
  });
  if (!record) {
    res.status(400).json({ error: "OTP not found" });
    return;
  }
  if (new Date() > record.expiresAt) {
    await prisma.emailVerification.delete({ where: { email } });
    res.status(400).json({ error: "OTP expired" });
    return;
  }

  const valid = await bcrypt.compare(otp, record.otp);
  if (!valid) {
    res.status(400).json({ error: "Invalid OTP" });
    return;
  }

  await prisma.emailVerification.delete({ where: { email } });

  const token = jwt.sign({ email }, process.env.EMAIL_VERIFICATION_SECRET!, {
    expiresIn: "5m",
  });
  res.json({ verificationToken: token });
};

export const logoutFunc = async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", { path: "/" });
  res.status(200).json("You logged out successfully.");
  return;
};

export const getAuthenticatedUser = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }
  try {
    const authUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        fullname: true,
        profilePic: true,
        driver: true,
        isSuspended:true
      },
    });

    if (!authUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

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
    const decodedUser = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as JwtPayload;

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
};


export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "You are unauthorized" });
      return;
    }

    const { newPassword, oldPassword } = req.body;

    if (!newPassword || !oldPassword) {
      res.status(400).json({ error: "Both new and old passwords are required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found!" });
      return;
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      res.status(403).json({ error: "Current password is incorrect" });
      return;
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      res.status(403).json({ error: "New password cannot be the same as current password" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({ message: "Password changed successfully" });
    return;
  } catch (err: any) {
    res.status(500).json({ error: "Internal server error! There was an error while changing the password" });
    return;
  }
};