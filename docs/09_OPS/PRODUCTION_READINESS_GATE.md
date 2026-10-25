# Production Readiness Gate

**Status: NOT READY for real gyms, member personal data, or payments.** Passing CI is necessary, but it does not mean the SaaS feature set or production environment is complete.

## Verified in CI
- Next.js Owner app production build
- Next.js Super Admin shell production build
- Next.js marketing site production build
- Express/TypeScript API compilation
- API smoke tests for health response, JSON 404, missing-auth fail-closed behavior, and malformed JSON

Latest verified successful baseline before production-hardening commits: CI #34. Re-run CI on the current commit before treating these checks as current.

## Blocking requirements before public launch
1. **Authentication:** wire Clerk into the Owner UI; protect every Owner route; configure Clerk issuer/keys in deployment environments. Super Admin must use a distinct, server-enforced allowlist/role, not just a separate URL.
2. **Persistence and business workflows:** implement persistent gym onboarding, branch and plan management, membership lifecycle, payment posting/refunds, attendance check-in/out, renewal reminders, and receipts. The current dashboard is a shell; placeholder metrics are intentional.
3. **Authorization:** test cross-gym and cross-branch access for every read/write route. Reject untrusted tenant IDs and validate membership/branch access server-side.
4. **Financial safety:** implement immutable ledger entries, idempotency, audit trails, duplicate reference/UTR handling, server-calculated subscription pricing, and a separate audited subscription approval flow. Never activate paid access from a submitted UTR alone.
5. **Database:** configure MongoDB Atlas production cluster, backups, restore drill, least-privilege DB user, network access rules, index creation and migration strategy. Verify connection pooling under serverless concurrency.
6. **Operations:** configure error monitoring, structured logs with sensitive fields redacted, alerts, backup/restore procedures, incident response, uptime monitoring, and rollback.
7. **Security:** review CORS origins, CSP and security headers, cookie/session policy, rate limits across multiple instances (the current in-memory limiter is not a shared distributed limit), input validation, upload scanning/storage, dependency audit, and penetration testing.
8. **Privacy/legal:** publish privacy policy, terms, retention/deletion policy, and appropriate consent/notice for member personal data.
9. **Load testing:** use a staging environment and synthetic data only. Ramp 100, 500, 1k, 5k, 10k concurrent users first; monitor p50/p95/p99 latency, 4xx/5xx rate, CPU/memory, DB connections, query latency and rate limiting. Only proceed toward 100k–200k after capacity modeling and staged results. Do not run a surprise stress test against production.
10. **Deployment validation:** deploy Owner, Admin, Marketing, and API as separate projects; configure production environment variables; test domains, TLS, Clerk redirects, CORS, health/readiness, DB access, and rollback.

## Required secrets/configuration (set in hosting dashboard, never commit)
- API: `NODE_ENV=production`, `MONGODB_URI`, `CLERK_SECRET_KEY`, `ALLOWED_ORIGINS` (exact deployed Owner/Admin origins).
- Owner app: Clerk publishable key and the deployed API base URL once auth integration is implemented.
- Admin app: independent server-enforced Super Admin authorization configuration before exposing the console.
- Email/notification credentials only after those workflows are implemented.

## Release decision
Do not mark production-ready until the blocking requirements above are implemented, tested, and signed off. A successful build or smoke test does not certify security, real payment handling, availability, or capacity for 100k–200k users.
