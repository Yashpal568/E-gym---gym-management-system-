import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: {
    colors: {
      background: "hsl(var(--background))", foreground: "hsl(var(--foreground))",
      card: "hsl(var(--card))", border: "hsl(var(--border))",
      primary: "hsl(var(--primary))", muted: "hsl(var(--muted))",
      accent: "hsl(var(--accent))"
    },
    boxShadow: { soft: "0 12px 40px rgba(15, 23, 42, 0.07)" }
  }},
  plugins: []
};
export default config;