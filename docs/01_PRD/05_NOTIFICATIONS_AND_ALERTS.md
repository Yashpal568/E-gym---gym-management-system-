# Notifications and Alerts

## Channels
1. In-app notification center and unread count.
2. Web Push for supported browsers after explicit permission.
3. Email reminders for membership expiry and overdue dues through a configured provider.

## Web Push
- Explain value before asking permission; do not repeatedly prompt after denial.
- Persist push subscription endpoint/keys securely and associate them with authenticated user and tenant.
- Provide enable/disable controls and remove invalid subscriptions.
- Send minimal sensitive content; use authenticated deep links for details.
- Protect endpoints with auth, authorization, rate limits and relevant CSRF controls.
- Web Push is best-effort, not guaranteed delivery. Keep in-app/email fallback.
- Do not claim delivery merely because a provider accepted a push.

## Email automation
Expiry schedule configurable (suggested 7, 3, 1 days and expiry day). Dues/overdue reminders configurable. Scheduler runs server-side, uses idempotency, respects timezone, cancels stale jobs after payment/renewal, retries safely and logs attempts/status/failure.