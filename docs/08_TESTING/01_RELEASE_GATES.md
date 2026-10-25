# Testing and Release Gates

- Cross-tenant reads/writes/aggregates/exports/uploads/jobs are denied.
- Gym Owner cannot access Super Admin endpoints.
- UTR submission stays pending; duplicate UTR flagged; unauthorized approval denied; repeated approval idempotent.
- Onboarding resumes after refresh/sign-out; checklist reflects backend state.
- Payments reconcile and financial events remain auditable.
- Duplicate attendance handled according to policy.
- Renewal prevents stale expiry notifications.
- Web Push permission, unsubscribe, invalid endpoint cleanup and email fallback tested.
- Light/dark/system themes, accessibility, responsive layouts and empty/loading/error states checked.
- Backup/restore, env validation, secret safety and staging E2E verified before launch.