import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../db/prisma.js";
import { generateAccessToken} from "../utils/generateTokens.js";


declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: string;
        username: string;
        fullname: string;
        driver: boolean,
        isSuspended: boolean
      };
    }
  }
}

interface DecodedToken extends JwtPayload {
  id: string;
  username:string,
}


const verify = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let accessToken = authHeader ? authHeader.split(" ")[1] : null;

  if (!accessToken) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json("You are not authenticated! No token provided.");
      return;
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as DecodedToken;

      const user = await prisma.user.findUnique({
        where: { username: decoded.username },
        select: {username:true, fullname:true, id:true, driver:true, isSuspended:true}
      });

      if (!user) {
        res.status(403).json("User not found!");
        return;
      }
      accessToken = await generateAccessToken(user.username);

      res.setHeader("Authorization", `Bearer ${accessToken}`);
      
      req.user = user;
      next();
      return;
    } catch (err) {
      res.status(403).json("Invalid refresh token.");
      return;
    }
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as DecodedToken;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }, select: {
      username:true, id:true, driver:true, fullname:true, isSuspended:true
    } });

    if (!user) {
      res.status(403).json("User not found!");
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(403).json("Invalid access token.");
    return;
  }
};

export default verify;