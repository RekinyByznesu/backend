import express from "express";
import { IJwtBody, verifyJwt } from "../utils/jwt";

export const protectedRoute = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  const token = req.headers["authorization"];
  if (!token) {
    res.status(403);
    res.json({ msg: "No token provided!" });
    return;
  }
  try {
    const userData = await verifyJwt(token.split(" ")[1]);
    if (!userData) {
      throw Error("Invalid token!");
    }
    res.locals.userData = userData as IJwtBody;
  } catch {
    res.status(403);
    res.json({ msg: "The token is invalid or it expired!" });
    return;
  }
  next();
};
