import { clerkMiddleware, getAuth } from "@clerk/express";
import type { RequestHandler } from "express";
import { env } from "../config/env";
export const clerkAuthMiddleware = env.CLERK_SECRET_KEY ? clerkMiddleware() : null;
export const requireUser: RequestHandler = (req, res, next) => {
  if (!env.CLERK_SECRET_KEY) return res.status(503).json({ error: "Authentication is not configured." });
  const auth = getAuth(req);
  if (!auth.userId) return res.status(401).json({ error: "Authentication required." });
  res.locals.authUserId = auth.userId;
  next();
};