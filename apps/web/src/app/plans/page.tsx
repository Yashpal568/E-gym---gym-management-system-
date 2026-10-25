"use client";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

type Workspace = { gym: { _id?: string; id?: string; name: string }; role: string };
type Branch = { _id: string; name: string };
type Plan = { _id: string; branchId: string; name: string; durationDays: number; pricePaise: number; description?: string };
const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const field: React.CSSProperties = { display: "block", width: "100%", marginTop: 5, padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, boxSizing: "border-box" };

export default function PlansPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [gymId, setGymId] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [name, setName] = useState("");
  const [days, setDays] = useState("30");
  const [price, setPrice] = useState("1000");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const headersFor = useCallback(async (id: string) => {
    const token = await getToken();
    if (!token) throw new Error("Session expired. Sign in again.");
    return { Authorization: `Bearer ${token}`, "x-gym-id": id };
  }, [getToken]);

  const refresh = useCallback(async (id: string, selectedBranch = branchId) => {
    if (!id || !apiBase) return;
    const headers = await headersFor(id);
    const [br, pr] = await Promise.all([
      fetch(`${apiBase}/api/branches`, { headers, cache: "no-store" }),
      fetch(`${apiBase}/api/plans${selectedBranch ? `?branchId=${encodeURIComponent(selectedBranch)}` : ""}`, { headers, cache: "no-store" })
    ]);
    const bb = await br.json(); const pb = await pr.json();
    if (!br.ok) throw new Error(bb.error || "Could not load branches.");
    if (!pr.ok) throw new Error(pb.error || "Could not load plans.");
    setBranches(bb.branches || []); setPlans(pb.plans || []);
  }, [branchId, headersFor]);

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        if (!apiBase) throw new Error("Set NEXT_PUBLIC_API_URL in Owner app environment.");
        const token = await getToken();
        if (!token) throw new Error("Please sign in again.");
        const response = await fetch(`${apiBase}/api/workspaces`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Could not load workspaces.");
        const list: Workspace[] = body.workspaces || [];
        if (cancelled) return;
        setWorkspaces(list);
        const id = list[0]?.gym?._id || list[0]?.gym?.id || "";
        setGymId(current => current || id);
      } catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : "Could not load workspaces."); }
    })();
    return () => { cancelled = true; };
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (!gymId || !isSignedIn || !apiBase) return;
    let cancelled = false;
    (async () => {
      try {
        setError("");
        const headers = await headersFor(gymId);
        const response = await fetch(`${apiBase}/api/branches`, { headers, cache: "no-store" });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Could not load branches.");
        const list: Branch[] = body.branches || [];
        if (cancelled) return;
        setBranches(list);
        const selected = branchId && list.some(b => b._id === branchId) ? branchId : list[0]?._id || "";
        setBranchId(selected);
        const plansResponse = await fetch(`${apiBase}/api/plans${selected ? `?branchId=${encodeURIComponent(selected)}` : ""}`, { headers, cache: "no-store" });
        const plansBody = await plansResponse.json();
        if (!plansResponse.ok) throw new Error(plansBody.error || "Could not load plans.");
        if (!cancelled) setPlans(plansBody.plans || []);
      } catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : "Could not load plans."); }
    })();
    return () => { cancelled = true; };
  }, [gymId, branchId, isSignedIn, getToken, headersFor]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      if (!gymId || !branchId) throw new Error("Create a gym workspace and branch first.");
      const headers = await headersFor(gymId);
      const response = await fetch(`${apiBase}/api/plans`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ branchId, name, durationDays: Number(days), pricePaise: Math.round(Number(price) * 100), description }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not create plan.");
      setMessage("Membership plan created."); setName(""); setDescription("");
      await refresh(gymId, branchId);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not create plan."); }
    finally { setBusy(false); }
  }

  async function archive(planId: string) {
    setError(""); setMessage("");
    try {
      const headers = await headersFor(gymId);
      const response = await fetch(`${apiBase}/api/plans/${planId}/archive`, { method: "PATCH", headers });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not archive plan.");
      setMessage("Plan archived; historical memberships remain unchanged.");
      await refresh(gymId, branchId);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not archive plan."); }
  }

  if (!isLoaded) return <main style={{ padding: 24 }}>Loading secure session…</main>;
  if (!isSignedIn) return <main style={{ padding: 24 }}><h1>Sign in required</h1><Link href="/sign-in">Continue to sign in</Link></main>;
  return <main style={{ maxWidth: 1000, margin: "4vh auto", padding: 24, fontFamily: "Arial, sans-serif" }}>
    <p><Link href="/">← Dashboard</Link></p><h1>Membership plans</h1><p>Create branch-specific plans. Prices are stored as integer paise.</p>
    {error && <p role="alert" style={{ padding: 12, background: "#fee2e2", color: "#991b1b" }}>{error}</p>}
    {message && <p role="status" style={{ padding: 12, background: "#dcfce7", color: "#166534" }}>{message}</p>}
    {workspaces.length > 1 && <label>Workspace<select value={gymId} onChange={e => setGymId(e.target.value)} style={field}>{workspaces.map(w => { const id = w.gym._id || w.gym.id || ""; return <option key={id} value={id}>{w.gym.name}</option>; })}</select></label>}
    <label>Branch<select value={branchId} onChange={e => setBranchId(e.target.value)} style={field}>{branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}</select></label>
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20, marginTop: 20 }}>
      <form onSubmit={submit} style={{ display: "grid", gap: 12, alignContent: "start", padding: 18, border: "1px solid #cbd5e1", borderRadius: 12 }}>
        <h2 style={{ margin: 0 }}>Create plan</h2>
        <label>Plan name<input required minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)} style={field} placeholder="Monthly membership"/></label>
        <label>Duration in days<input required type="number" min="1" max="3660" value={days} onChange={e => setDays(e.target.value)} style={field}/></label>
        <label>Price (₹)<input required type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} style={field}/></label>
        <label>Description<input maxLength={500} value={description} onChange={e => setDescription(e.target.value)} style={field}/></label>
        <button disabled={busy || !branchId} style={{ padding: 12, background: "#4338ca", color: "white", border: 0, borderRadius: 8 }}>{busy ? "Saving…" : "Create plan"}</button>
      </form>
      <section style={{ padding: 18, border: "1px solid #cbd5e1", borderRadius: 12 }}><h2 style={{ marginTop: 0 }}>Active plans</h2>
        {plans.length === 0 ? <p>No plans yet.</p> : plans.map(p => <article key={p._id} style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}><strong>{p.name}</strong><p>{p.durationDays} days · ₹{(p.pricePaise / 100).toFixed(2)}</p>{p.description && <p>{p.description}</p>}<button onClick={() => void archive(p._id)} style={{ padding: "6px 10px" }}>Archive</button></article>)}
      </section>
    </section>
  </main>;
}
