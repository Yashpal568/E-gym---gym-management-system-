# Security Test Plan

- Authentication: invalid, expired and missing Clerk token rejected.
- Authorization: Gym Owner cannot call Super Admin APIs; role changes cannot be forged from client input.
- Tenant isolation: attempt cross-tenant access by IDs, filters, search, aggregates, export, uploads and background jobs.
- Subscription: UTR cannot self-approve; duplicate UTR flagged; client cannot alter price/period; approval retry cannot double-activate.
- Uploads: reject oversized, mismatched MIME, invalid content and unauthorized proof access.
- Web Push: reject unauthorized subscription changes, protect endpoints/keys, clean invalid endpoints, minimize payload data.
- Notifications: enforce tenant/user scope and avoid leaking private member/financial details.
- Abuse: rate limits on auth-adjacent, UTR submission, search and notification endpoints.
- Secrets: scan repository for secrets and ensure server-only keys are not exposed in client bundles.
- Finance: verify idempotent payment posting and exact money arithmetic.
- Operations: verify backup/restore and safe production errors.