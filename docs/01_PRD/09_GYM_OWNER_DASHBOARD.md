# Gym Owner Dashboard Requirements

## Information hierarchy
- Membership count and active/expiring/expired memberships
- Today's attendance and attendance trend
- Financial summary: billed, collected, outstanding, refunded/adjusted and net collections
- Due and expiry queues
- Recent payment activity
- Quick actions: add member, record payment, check in, create plan and renew membership
- Persistent setup checklist until required onboarding tasks are complete

## Accuracy
All financial cards and charts must be computed from authorized backend data, carry a clear date range and reconcile with the ledger. Never ship fake metrics.

## UX
Light-first professional visual direction with electric blue/violet accents; also support dark and system themes. Responsive tables and cards for narrow browser widths. Provide loading, empty, error and permission-denied states.