# GymSphere — Project Overview

GymSphere is a subscription-based multi-tenant gym management SaaS. Phase 1 includes a Gym Owner web app, a separate Super Admin console, a public marketing website and a Node.js backend API. Native member mobile app is Phase 2.

## Owner journey
Marketing website → Clerk sign-in → select GymSphere plan → submit UTR/payment details → Super Admin independently verifies and approves → subscription activates exactly once → guided gym onboarding → add members and memberships → record fees/payments and attendance → backend sends expiry/dues alerts.

## Stack
- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Shadcn Studio components and Lucide React.
- Backend: Node.js, Express and TypeScript.
- Database: MongoDB Atlas and Mongoose.
- Authentication: Clerk.
- Notifications: in-app notifications, browser Web Push and email reminders.
- Theme: light, dark and system preference.

## Design direction
Professional light-first interface, white surfaces, subtle borders, premium typography and electric blue/violet accents. Dark mode must be fully supported. Super Admin has a separate platform-level shell and authorization boundary.