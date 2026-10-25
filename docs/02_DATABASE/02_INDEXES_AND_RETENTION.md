# Indexes and Data Retention

Create indexes based on actual query patterns and validate with explain plans. Likely indexes include tenant+status, tenant+createdAt, tenant+memberId, tenant+expiryDate, branch+checkInTime, subscriptionRequest status+createdAt, normalized UTR fingerprint, reminder dueAt+status, notification user+createdAt and push subscription ownership.

Avoid globally unique member fields unless business rules require them; uniqueness should normally be tenant-scoped. UTR deduplication needs a documented normalization strategy and careful handling of legitimate provider formats.

Define retention for audit logs, payment proofs, notification deliveries and expired push subscriptions. Do not delete financial/audit records simply because a subscription expires. Follow applicable legal and privacy requirements and owner-configured retention policy.