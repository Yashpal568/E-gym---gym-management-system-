import mongoose from "mongoose";
import { env } from "./env";
let connected = false;
export async function connectDatabase() {
  if (!env.MONGODB_URI) {
    if (env.NODE_ENV === "production") throw new Error("MONGODB_URI is required in production.");
    return false;
  }
  if (connected || mongoose.connection.readyState === 1) return true;
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  connected = true;
  return true;
}