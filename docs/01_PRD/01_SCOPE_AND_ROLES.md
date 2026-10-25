# Product Scope and Roles

## Roles
- Platform Super Admin: global tenant/subscription controls with explicit authorization.
- Gym Owner: manages only their gym and permitted branches.
- Gym Manager: permissioned operational access.
- Receptionist: member lookup, attendance and payment recording only when granted.
- Trainer: limited member/attendance access when granted.
- Member: no standalone native app in Phase 1.

## Phase 1
Multi-tenant SaaS, marketing website, Clerk auth, Gym Owner app, Super Admin console, manual UTR approval, onboarding, members, memberships, fees, payment history, receipts, attendance, staff, reports, in-app alerts, web push and email reminders.

## Out of scope
Native member app, native push notifications and gym discovery marketplace. Web Push works only on supported browsers after permission; in-app and email remain fallbacks.