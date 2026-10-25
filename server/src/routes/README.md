# API route conventions

- All business routes must use verified Clerk identity.
- Resolve gym access through internal GymMembership records; never rely on client-supplied role claims.
- Tenant-owned queries must include the server-resolved gymId filter.
- Validate bodies and query parameters with Zod, cap pagination and payload size, and return safe errors.
- Add audit events for financial or privileged state changes.
- A UTR is a claim only. Subscription activation requires independently verified payment and an audited, idempotent approval.
- Apply write rate limits to mutation endpoints and test cross-tenant access explicitly.
