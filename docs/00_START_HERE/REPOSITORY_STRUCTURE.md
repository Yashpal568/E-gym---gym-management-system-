# Target Repository Structure

```text
/
├── apps/
│   ├── web/                 # Gym Owner Next.js app
│   ├── admin/               # Separate Super Admin Next.js app
│   └── marketing/           # Public marketing Next.js app
├── server/
│   ├── src/
│   │   ├── modules/         # auth, tenants, subscriptions, members, fees, attendance
│   │   ├── middleware/      # auth, tenant scope, rate limit, validation
│   │   ├── jobs/            # expiry/dues reminders and notification dispatch
│   │   └── config/
│   └── tests/
├── packages/
│   ├── shared/              # shared types and validation schemas
│   └── ui/                  # shared tokens/components where appropriate
├── docs/
│   ├── 00_START_HERE/
│   ├── 01_PRD/
│   ├── 02_DATABASE/
│   ├── 03_ARCHITECTURE/
│   ├── 04_API/
│   ├── 05_SECURITY/
│   ├── 06_UI_UX/
│   ├── 07_MILESTONES/
│   ├── 08_TESTING/
│   └── 09_OPERATIONS/
├── .env.example
├── .gitignore
├── AGENTS.md
├── package.json
└── README.md
```

This is the target structure, not a claim that the applications have already been implemented. Build one milestone at a time.