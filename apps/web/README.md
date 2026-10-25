# GymSphere Owner Web App

Next.js App Router + TypeScript owner workspace.

## Deploy to Vercel
- Import this repository as a new Vercel project.
- Set **Root Directory** to `apps/web`.
- Enable **Include source files outside of the Root Directory** (the workspace package manifest is at repository root).
- Framework preset: Next.js.
- Install command: `cd ../.. && npm install`.
- Build command: `cd ../.. && npm run build:web`.
- Do not set a custom output directory for a Next.js deployment.
- Add environment variables only when auth/API integration is implemented; never commit secrets.

The first screen intentionally shows placeholders rather than fake business metrics. Authentication, persistent onboarding, and data workflows are not implemented yet.
