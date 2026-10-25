# Gym Onboarding and Setup Checklist

Subscription state and onboarding state are separate. Owner may save basic setup while subscription review is pending, but paid operational entitlements remain inactive until approval.

## Wizard
1. Gym profile: name, owner/contact, address, timezone, operating hours and optional logo.
2. Main branch and branch limits based on subscription plan.
3. Membership plans: duration, INR price, joining fee and benefits.
4. Fee/receipt settings: payment methods, partial payment policy and receipt details.
5. Attendance: check-in policy, duplicate window and expired-member override rules.
6. Notifications: email reminders, in-app alerts and optional browser push permission.
7. Add first member: member details, plan, membership dates and fee charge. Record a payment only after explicit user submission.
8. Review and finish.

Save progress server-side, survive refresh/sign-out, and resume at the last incomplete step. Tenant creation must be idempotent.

## Persistent checklist
Profile, branch, plans, fee settings, attendance, first member and reminders. Each item links to its workflow and is marked complete only from backend-persisted state. Checklist can be reopened after completion.