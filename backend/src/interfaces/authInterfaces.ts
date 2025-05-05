import { JwtPayload } from "jsonwebtoken";


export interface AuthUser {
  id: string;
  username: string;
  password: string;
  fullname:string,
  isAdmin: boolean;
}



export interface DecodedToken extends JwtPayload {
  id: string;
}