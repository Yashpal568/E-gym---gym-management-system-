"use client";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Workspace = {
  gym: { _id?: string; id?: string; name: string; slug: string; status: string; timezone: string; currency?: string };
  role: string;
  branchIds?: string[];
};
const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

function SetupUnavailable() {
  return <main style={{ maxWidth: 680, margin: "8vh auto", padding: 24, fontFamily: "Arial, sans-serif" }}>
    <h1>Connect your gym workspace</h1>
    <p>Before creating a workspace, configure <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> in the Owner app and <code>CLERK_SECRET_KEY</code>, <code>MONGODB_URI</code>, and the Owner origin in <code>ALLOWED_ORIGINS</code> for the API.</p>
    <p>Also set <code>NEXT_PUBLIC_API_URL</code> to the deployed API base URL. These values belong in hosting environment settings, not in source code.</p>
    <Link href="/sign-in">Sign in</Link>
  </main>;
}

function WorkspaceForm() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [gymName, setGymName] = useState("");
  const [branchName, setBranchName] = useState("Main Branch");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadWorkspaces = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      if (!token) throw new Error("Could not get a sign-in token. Please sign in again.");
      const response = await fetch(`${apiBase}/api/workspaces`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not load workspaces.");
      setWorkspaces(body.workspaces || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to the API.");
    }
  }, [getToken, isSignedIn]);

  useEffect(() => { void loadWorkspaces(); }, [loadWorkspaces]);

  async function createWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      if (!apiBase) throw new Error("API URL is missing. Set NEXT_PUBLIC_API_URL in the Owner app environment.");
      const token = await getToken();
      if (!token) throw new Error("Please sign in again before creating your gym.");
      const response = await fetch(`${apiBase}/api/workspaces`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ gymName, branchName, address, phone, timezone: "Asia/Kolkata" })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Workspace could not be created.");
      setMessage(`Workspace “${body.workspace.gym.name}” created successfully.`);
      setGymName(""); setBranchName("Main Branch"); setAddress(""); setPhone("");
      await loadWorkspaces();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while creating the workspace.");
    } finally { setBusy(false); }
  }

  if (!isLoaded) return <main style={{ maxWidth: 680, margin: "8vh auto", padding: 24 }}>Loading secure session…</main>;
  if (!isSignedIn) return <main style={{ maxWidth: 680, margin: "8vh auto", padding: 24, fontFamily: "Arial, sans-serif" }}><h1>Sign in to GymSphere</h1><p>You must sign in before creating or viewing a gym workspace.</p><Link href="/sign-in">Continue to sign in</Link></main>;

  return <main style={{ maxWidth: 760, margin: "5vh auto", padding: 24, fontFamily: "Arial, sans-serif" }}>
    <p><Link href="/">← Dashboard</Link></p>
    <h1>Set up your gym</h1>
    <p>Create your gym and first branch. Your signed-in Clerk identity becomes the owner; owner identity is never accepted from the form.</p>
    {error && <p role="alert" style={{ padding: 12, borderRadius: 8, background: "#fee2e2", color: "#991b1b" }}>{error}</p>}
    {message && <p role="status" style={{ padding: 12, borderRadius: 8, background: "#dcfce7", color: "#166534" }}>{message}</p>}
    <form onSubmit={createWorkspace} style={{ display: "grid", gap: 14, padding: 20, border: "1px solid #d1d5db", borderRadius: 14 }}>
      <label>Gym name<input required minLength={2} maxLength={120} value={gymName} onChange={e => setGymName(e.target.value)} style={fieldStyle}/></label>
      <label>First branch name<input required minLength={2} maxLength={100} value={branchName} onChange={e => setBranchName(e.target.value)} style={fieldStyle}/></label>
      <label>Address (optional)<input maxLength={500} value={address} onChange={e => setAddress(e.target.value)} style={fieldStyle}/></label>
      <label>Contact phone (optional)<input maxLength={24} value={phone} onChange={e => setPhone(e.target.value)} style={fieldStyle}/></label>
      <button disabled={busy} type="submit" style={{ padding: "12px 16px", border: 0, borderRadius: 9, background: "#4338ca", color: "white", fontWeight: 700 }}>{busy ? "Creating workspace…" : "Create gym workspace"}</button>
    </form>
    <section style={{ marginTop: 28 }}>
      <h2>Your workspaces</h2>
      {workspaces.length === 0 ? <p>No gym workspaces found yet.</p> : workspaces.map((workspace, index) => <article key={workspace.gym._id || workspace.gym.id || workspace.gym.slug || index} style={{ padding: 16, marginTop: 10, border: "1px solid #d1d5db", borderRadius: 12 }}><strong>{workspace.gym.name}</strong><p style={{ marginBottom: 0 }}>Role: {workspace.role} · Status: {workspace.gym.status}</p></article>)}
    </section>
  </main>;
}

const fieldStyle: React.CSSProperties = { display: "block", width: "100%", marginTop: 6, padding: 11, border: "1px solid #cbd5e1", borderRadius: 8, boxSizing: "border-box" };

export default function OnboardingPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return <SetupUnavailable />;
  return <WorkspaceForm />;
}
