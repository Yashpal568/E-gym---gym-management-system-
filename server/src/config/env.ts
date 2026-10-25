import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000")
}).superRefine((value, ctx) => {
  if (value.NODE_ENV !== "production") return;
  if (!value.MONGODB_URI?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["MONGODB_URI"], message: "MONGODB_URI is required in production." });
  }
  if (!value.CLERK_SECRET_KEY?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["CLERK_SECRET_KEY"], message: "CLERK_SECRET_KEY is required in production." });
  }
  const origins = value.ALLOWED_ORIGINS.split(",").map(origin => origin.trim()).filter(Boolean);
  if (!origins.length || origins.some(origin => origin.includes("localhost"))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["ALLOWED_ORIGINS"], message: "Production ALLOWED_ORIGINS must contain explicit deployed origins and no localhost origin." });
  }
});
export const env = schema.parse(process.env);
export const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
