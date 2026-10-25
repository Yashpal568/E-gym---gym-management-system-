import type { ErrorRequestHandler } from "express";
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = Number.isInteger(error?.status) && error.status >= 400 && error.status < 600 ? error.status : 500;
  if (status >= 500) console.error("Unhandled API error", error);
  res.status(status).json({ error: status === 500 ? "Internal server error" : (error?.message || "Request failed") });
};