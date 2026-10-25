# GymSphere Subscription and Manual UTR Approval

## Owner flow
Select plan → see payment instructions → submit UTR, claimed amount, transaction date and optional proof. Request remains pending until reviewed.

## Super Admin flow
Review gym/owner, plan, period, server-calculated amount, UTR, transaction date and private proof. Check duplicate UTR warnings. Independently verify the transaction against receiving bank/UPI records before approving.

## Security
- UTR and screenshot are claims, not verified payment.
- Submission never activates paid access.
- Server recalculates price and period from trusted plan data.
- Duplicate UTRs are flagged and cannot be silently approved.
- Approval requires authorized admin, confirmation, verification notes and audit event.
- Rejection requires a reason.
- Approval atomically records decision and entitlement; repeated requests are idempotent.
- Proof uploads are private, validated and access-controlled.
- Notify owner of status without exposing internal notes.