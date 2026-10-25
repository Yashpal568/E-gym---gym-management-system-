# Phase 1 Acceptance Criteria

1. Clerk authentication is verified server-side and mapped to internal user/roles.
2. Tenant-owned data cannot be read or modified across gym boundaries, including search, reports, exports, uploads and background jobs.
3. Super Admin is isolated by explicit backend authorization.
4. UTR submission never activates paid access; duplicate UTRs are flagged; approval is independently verified, audited, atomic and idempotent.
5. Owner can complete and resume onboarding; checklist derives from saved backend state.
6. Member/membership creation, charges, full/partial payments, balances and receipts work end-to-end.
7. Attendance check-in, duplicate protection and authorized overrides are tested.
8. Expiry and dues reminder automation handles retries and cancels stale reminders after renewal/payment.
9. In-app notifications and Web Push subscription management work; push failures fall back to in-app/email and are logged.
10. Light, dark and system theme work across owner, admin and marketing pages.
11. Marketing pricing is sourced from published plan configuration and SEO metadata is present.
12. Responsive behavior, accessibility, loading/empty/error states and security tests pass.
13. Production deployment, backups, restore procedure, secrets and monitoring are documented and verified.