import rateLimit from "express-rate-limit";
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again shortly." },
  skip: (req) => req.path === "/health"
});
export const writeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many write requests. Please try again shortly." }
});