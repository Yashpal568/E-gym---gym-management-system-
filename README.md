# GymSphere

GymSphere is a multi-tenant gym management SaaS. Phase 1 is a web-first product with a Gym Owner app, separate Super Admin console, marketing website, Node.js backend, Clerk authentication, manual UTR subscription approval, guided onboarding, member/fee/attendance management, and web/email notifications.

## Repository map
- `apps/web`: Gym Owner dashboard (Next.js App Router)
- `apps/admin`: separate Super Admin control-plane shell (Next.js)
- `apps/marketing`: public marketing website (Next.js)
- `server`: Express + TypeScript API foundation
- `docs/`: product requirements, architecture, database, API, security, UI/UX, milestones and release gates

## Local development
Requires Node.js 20.9+ and npm.

```bash
npm install
npm run dev:web
npm run dev:api
```

Owner app: http://localhost:3000  
API health: http://localhost:4000/api/health

## Deploy on Vercel
Deploy the owner app, marketing website, Super Admin and API as **separate Vercel projects** from this repository. For each project, set the appropriate Root Directory and use the commands documented in that app's README. Do not configure a custom output directory for Next.js projects. A custom domain can be attached later in Vercel project settings.

## Important current status
The first dashboard UI, marketing landing page, Super Admin shell, and API health foundation are committed. This is **not yet a complete production product**: Clerk authentication, tenant-safe data access, database models, onboarding persistence, member/payment/attendance workflows, UTR review, notifications, and automated tests still need implementation before real gyms or financial data are onboarded. Dashboard values are intentionally placeholders rather than fabricated metrics.

## Security and product rules
- Never trust client-provided `gymId`; resolve tenant scope on the server from verified identity and internal memberships.
- UTR submission is a claim, not proof of payment. Paid access only changes after authorized, audited verification.
- Posted financial records must not be silently edited or deleted.
- Never commit secrets. Use Vercel environment variables.
- Keep Super Admin authorization separate from gym-owner roles.

Start with `docs/00_START_HERE/PROJECT_OVERVIEW.md` and `docs/00_START_HERE/BUILD_PLAN.md`.
