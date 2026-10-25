# Marketing Website Requirements

Build with Next.js App Router, TypeScript and the shared design system. SEO-first, responsive, light/dark/system theme support.

## Pages
- Home and product positioning
- Features and workflow pages
- Pricing page driven by published plans from the backend
- Contact/demo enquiry form
- FAQ and educational content
- Privacy, terms, cancellation/refund and other required policy pages

## Admin-managed content
Super Admin may manage published pricing, feature descriptions, FAQs, announcements and SEO metadata. Validate and sanitize rich text. Draft/published states and audit history are required.

## SEO and performance
Unique titles/descriptions, canonical URLs, sitemap, robots rules, Open Graph metadata, structured data where valid, image optimization, accessible headings and server-rendered content. Never expose private tenant data or unpublished admin content.

## Conversion
Clear sign-up/login/demo CTAs. Pricing and plan limits must come from trusted server-side plan configuration, not hardcoded mismatched values.