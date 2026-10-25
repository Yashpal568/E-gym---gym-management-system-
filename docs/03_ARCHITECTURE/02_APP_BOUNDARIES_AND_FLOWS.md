# Application Boundaries and Critical Flows

- Marketing: public SEO pages, published pricing/features/FAQ/contact.
- Gym Owner: tenant-scoped operations only.
- Super Admin: platform-wide tenant/subscription operations with distinct permissions.
- API: authentication verification, tenant authorization, entitlements, financial integrity and audit.
- Worker: reminders, push/email dispatch, retries and stale-job cancellation.

Critical flows:
- UTR submission does not grant entitlements.
- Approval independently verifies payment and atomically activates one period.
- Onboarding progress is independent from subscription status and saved server-side.
- Fee balances derive from ledger events.
- Renewal cancels stale expiry reminders.
- Push/email status is logged; failures do not erase in-app notification history.