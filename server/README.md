# GymSphere API

Node.js + Express + TypeScript API foundation.

## Local development
1. Copy the repository root `.env.example` to `.env` and configure local values.
2. Install dependencies from repository root with `npm install`.
3. Run `npm run dev:api`.

Health endpoint: `GET /api/health`.

## Vercel deployment
Create a separate Vercel project from this repository with Root Directory set to `server`. Ensure source files outside the root are included if required by workspace installation. Use `npm install` and the Vercel Node.js function configuration in `vercel.json`.

This is only the API foundation. No business endpoints should be considered production-ready until Clerk token verification, internal role/tenant resolution, rate limits, audit trails and tests are implemented.
