import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js";


const generateAccessToken = async (username: string | undefined): Promise<string> => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables.");
  }
  if (!username) {
    throw new Error("Username is required.");
  }
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      fullname: true,
      isAdmin: true,
    },
  });
  if (!user) {
    throw new Error("User not found.");
  }
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin, fullname: user.fullname, username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "50m", algorithm: "HS256" }
  );
};


const generateRefreshToken = async (username: string | undefined): Promise<string> => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined in environment variables.");
  }
  if (!username) {
    throw new Error("Username is required.");
  }
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      isAdmin: true,
    },
  });
  if (!user) {
    throw new Error("User not found.");
  }
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin, username: user.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d", algorithm: "HS256" }
  );
};

export { generateAccessToken, generateRefreshToken };
