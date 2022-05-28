import express from "express";
import ExpressBrute from "express-brute";
import { RateLimitedResponseDTO } from "../models/ratelimit";

const store = new ExpressBrute.MemoryStore();

const failCallback: ExpressBrute.FailCallback = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
  nextValidRequestDate: Date
) => {
  res.status(429).json({
    msg: "Too many requests in this time frame.",
    nextValidRequestDate: nextValidRequestDate.toISOString(),
  } as RateLimitedResponseDTO);
};

const getBruteforce = new ExpressBrute(store, {
  freeRetries: 80_000, // TODO: fix this
  minWait: 60 * 1000, // 1 minute
  maxWait: 15 * 60 * 1000, // 15 minutes,
  failCallback,
});
const postBruteforce = new ExpressBrute(store, {
  freeRetries: 5_000,
  minWait: 5 * 60 * 1000, // 5 minutes
  maxWait: 60 * 60 * 1000, // 1 hour,
  failCallback,
});

export const rateLimit = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<express.RequestHandler> =>
  req.method.toUpperCase() === "GET"
    ? getBruteforce.prevent(req, res, next)
    : postBruteforce.prevent(req, res, next);
