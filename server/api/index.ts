import type { VercelRequest, VercelResponse } from "@vercel/node";
import { app } from "../src/app";
import { connectDatabase } from "../src/config/database";

// Reuse the cached Mongoose connection across warm serverless invocations.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    // Do not leak connection strings or internal driver details to callers.
    console.error("API request initialization failed", error instanceof Error ? error.message : "unknown error");
    return res.status(503).json({ error: "Service temporarily unavailable." });
  }
}
