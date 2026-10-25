# API Conventions and Security

- Use consistent versioning such as /api/v1.
- Validate bodies, query parameters and route parameters.
- Verify Clerk token/session on protected endpoints.
- Resolve internal user, role, gym and branch scope server-side.
- Return stable error codes; never leak stack traces or secrets.
- Apply rate limits, request-size limits, bounded pagination and secure headers.
- Use idempotency for payment posting, subscription approval and scheduled notifications.
- Audit sensitive administrative operations.
- Keep payment proof private with authorized access.
- Define each endpoint's authentication, scope, validation, audit, idempotency and error behavior.