# Environment and Deployment

Create .env.example with placeholders only. Variable categories: runtime, MongoDB URI, Clerk publishable key, server-only Clerk secret/webhook secret, app URLs, email provider credentials, private object-storage credentials, Web Push VAPID keys and monitoring settings.

Use separate development/staging/production credentials. Never commit .env or expose server secrets through NEXT_PUBLIC variables. Configure HTTPS, strict CORS, secure cookies, MongoDB least privilege/network restrictions, backups, tested restore, production email sender, worker scheduling, monitoring and rollback.