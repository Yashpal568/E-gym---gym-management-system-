import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <main style={{ maxWidth: 640, margin: "10vh auto", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>GymSphere account setup required</h1>
      <p>Account creation is not enabled until Clerk is configured. Set <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> for the Owner app and <code>CLERK_SECRET_KEY</code> for the API in your hosting environment.</p>
      <Link href="/sign-in">Go to sign in</Link>
    </main>;
  }
  return <main style={{ display: "grid", minHeight: "100vh", placeItems: "center", padding: 24 }}><SignUp routing="hash" /></main>;
}
