import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está definido en el .env");
}

export interface JwtPayload {
  userId: string;
  role: "repartidor" | "admin";
  username?: string;
  email?: string;
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (header && header.startsWith("Bearer ")) {
    return header.substring(7);
  }
  const cookie = req.cookies.get("repto_token");
  return cookie?.value ?? null;
}
