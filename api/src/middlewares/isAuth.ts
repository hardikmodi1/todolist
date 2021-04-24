import { RequestHandler } from "express";
import { verify } from "jsonwebtoken";

export const isAuth: RequestHandler<{}, any, any, {}> = (req, _, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error("Not Authenticated");
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new Error("Not Authenticated");
  }

  try {
    const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
    (req as any).userId = payload.userId;
    next();
    return;
  } catch {}

  throw new Error("Not Authenticated");
};
