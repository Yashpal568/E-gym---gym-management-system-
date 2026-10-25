# Architecture and Technology Stack

## Frontend
Use Next.js App Router and TypeScript, not Vite or a standalone React SPA. Use Tailwind CSS, shadcn/ui, licensed Shadcn Studio components where available, and Lucide React icons. Prefer a Next.js monorepo with separate route groups and app shells for marketing, owner and Super Admin unless deployment boundaries justify separately deployed Next.js apps. Backend authorization remains mandatory.

## Backend
Node.js, Express and TypeScript API with modular feature boundaries and background scheduler/worker. MongoDB Atlas and Mongoose.

## Authentication
Clerk for sign-in/sign-up and session identity. Backend verifies Clerk tokens and maps identity to internal user, roles and tenant memberships.

## Notifications and themes
In-app notifications, browser Web Push through a service worker, email reminders, and light/dark/system theme. Native mobile push is Phase 2.