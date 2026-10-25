# Super Admin Panel Requirements

Super Admin is a separate platform-level workspace with distinct navigation and strict backend authorization.

## Modules
- Platform dashboard and platform billing metrics
- Gyms/tenants: search, detail, status, subscription state and usage
- Subscription requests: pending, approved, rejected, duplicate UTR flags
- Payment verification detail: gym/owner, plan, period, claimed amount, UTR, date, private proof, verification notes
- Approve/reject actions; rejection reason required; approval independently verified and idempotent
- Plan catalogue, pricing, branch/member limits and feature entitlements
- User and role administration with audit history
- Marketing content, pricing, FAQ and SEO management
- Enquiries, audit logs and platform settings

## Security
Never rely on frontend route hiding. All platform endpoints require a server-verified Super Admin role. Record actor, timestamp, action, target and reason for sensitive changes. Tenant support access must be explicitly authorized and audited.