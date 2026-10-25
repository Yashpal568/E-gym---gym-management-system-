import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <main style={{ maxWidth: 640, margin: "10vh auto", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>GymSphere sign-in setup required</h1>
      <p>Set <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> in the Owner app deployment environment, and set <code>CLERK_SECRET_KEY</code> in the API environment. Then redeploy both services.</p>
      <p>For security, workspace creation and member data remain unavailable until authentication is configured.</p>
      <Link href="/">Return to dashboard</Link>
    </main>;
  }
  return <main style={{ display: "grid", minHeight: "100vh", placeItems: "center", padding: 24 }}><SignIn routing="hash" /></main>;
}
