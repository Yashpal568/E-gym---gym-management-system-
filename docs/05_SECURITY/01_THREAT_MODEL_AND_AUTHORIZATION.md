# Threat Model and Authorization Baseline

Protect against cross-tenant IDOR/data leakage, privilege escalation, UTR replay/duplicate fraud, malicious uploads, brute-force abuse, XSS/CSRF, secret leakage, webhook replay and notification leakage.

Roles: Platform Super Admin, Gym Owner, Gym Manager, Receptionist and Trainer. Permissions are server-side and least-privilege. Never grant Super Admin based only on email, frontend route or client-editable metadata.

Controls: Clerk token verification, internal role mapping, tenant/branch scoping on every operation, rate limiting, validation, secure headers, safe errors, audit logs, private file storage, duplicate UTR checks, independent payment verification, idempotent activation, secrets management, restricted DB access, backups and cross-tenant tests.