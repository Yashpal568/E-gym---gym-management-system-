import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
export const metadata: Metadata = {
  title: { default: "GymSphere | Gym Management", template: "%s | GymSphere" },
  description: "Manage gym members, memberships, fees, attendance and renewals in one secure workspace.",
  applicationName: "GymSphere",
  robots: { index: false, follow: false }
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body><ThemeProvider>{children}</ThemeProvider></body></html>;
}