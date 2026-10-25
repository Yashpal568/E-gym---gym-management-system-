# Data Model and Tenant Isolation

Use MongoDB Atlas and Mongoose. Every tenant-owned record carries trusted gymId; branch-specific records also carry branchId where relevant. Candidate collections include internal users, gyms, branches, role memberships, membership plans, memberships, members, charges, payments/allocations, refunds/adjustments, attendance, GymSphere subscription plans, subscription requests, audit logs, notifications, push subscriptions, reminder jobs and delivery logs.

## Tenant security
Resolve tenant from verified Clerk identity plus internal user-to-gym membership and role. Never treat client-supplied gymId as authorization. Scope reads, writes, aggregates, exports, uploads, notifications and background jobs. Super Admin cross-tenant operations require explicit platform authorization and audit.

## Financial integrity
Use integer paise or exact decimals; keep financial events auditable; avoid silent edits/deletes; make payment posting and subscription approval idempotent. Index tenant-scoped lookups, member search, expiry queues, UTR deduplication and scheduler eligibility.