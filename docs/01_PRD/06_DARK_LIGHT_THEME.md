# Dark Mode and Light Mode

Support light, dark and system-preference modes across Gym Owner, Super Admin and marketing website. Persist authenticated user's preference and avoid theme flash during hydration.

- Use design tokens/CSS variables for backgrounds, surfaces, borders, text, muted text, accent, focus and status colors.
- Keep electric blue/violet accents consistent across themes.
- Ensure strong contrast, visible focus and chart/table readability in both themes.
- Test dialogs, menus, forms, toasts, charts, tables, empty/loading/error states and Clerk UI in both themes.
- Do not simply invert colors; validate every component.