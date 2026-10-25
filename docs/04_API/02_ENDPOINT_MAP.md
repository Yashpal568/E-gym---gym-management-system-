# API Endpoint Map

Logical endpoint groups only; implementation must define exact routes and schemas.

- Identity/profile: authenticated internal identity, roles and tenant memberships
- Gyms/branches: profile, settings, branches and onboarding progress
- Plans/memberships: plan CRUD, membership start/renew/status
- Members: list/search/profile/history
- Ledger/payments: charges, allocations, receipts, adjustments/refunds/voids
- Attendance: check-in/history/reports/authorized overrides
- GymSphere subscription: plan catalogue, request, UTR/proof submission and owner status
- Super Admin: tenant management, subscription decisions, plans/limits, content, enquiries and audit
- Notifications: in-app list/read state, Web Push subscribe/unsubscribe, email delivery status
- Reports: date-bounded summaries and CSV export
- Public content: published pricing, features, FAQ and contact enquiry

Every endpoint documents authentication, roles, tenant/branch scope, validation, rate limits, idempotency, audit behavior and errors.