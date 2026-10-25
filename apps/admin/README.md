# GymSphere Super Admin

Separate Next.js control-plane UI. Deploy as a separate Vercel project with Root Directory `apps/admin`, enable source files outside the root, use install command `cd ../.. && npm install` and build command `cd ../.. && npm run build:admin`. Leave the output directory unset.

Do not expose as a production admin tool until dedicated Super Admin authentication, server-side authorization, audit logging and access tests are complete.
