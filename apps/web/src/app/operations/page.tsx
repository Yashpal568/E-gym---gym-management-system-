"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useState } from "react";

type Workspace = { gym: { _id?: string; id?: string; name: string }; role: string };
type Branch = { _id: string; name: string };
type Member = { _id: string; fullName: string; memberCode: string; phone: string; status: string };
type Plan = { _id: string; name: string; durationDays: number; pricePaise: number; isActive?: boolean };
type RecordRow = { _id: string; checkedInAt?: string; checkedOutAt?: string | null; receivedAt?: string; amountPaise?: number; method?: string; status?: string; memberId?: Member | string; planNameSnapshot?: string };
const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const field: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid var(--border, #d1d5db)", borderRadius: 9, background: "var(--background, white)", color: "var(--foreground, #111827)", boxSizing: "border-box" };
const card: React.CSSProperties = { border: "1px solid var(--border, #e5e7eb)", borderRadius: 14, padding: 18, background: "var(--card, white)" };
const button: React.CSSProperties = { border: 0, borderRadius: 9, padding: "10px 14px", background: "#2563eb", color: "white", fontWeight: 650, cursor: "pointer" };
const label: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 };

export default function OperationsPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [gymId, setGymId] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [memberships, setMemberships] = useState<RecordRow[]>([]);
  const [attendance, setAttendance] = useState<RecordRow[]>([]);
  const [payments, setPayments] = useState<RecordRow[]>([]);
  const [memberId, setMemberId] = useState("");
  const [planId, setPlanId] = useState("");
  const [startsAt, setStartsAt] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("upi");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const headersFor = useCallback(async (id = gymId) => {
    const token = await getToken();
    if (!token) throw new Error("Session expired. Please sign in again.");
    return { Authorization: `Bearer ${token}`, "x-gym-id": id, "Content-Type": "application/json" };
  }, [getToken, gymId]);

  const refresh = useCallback(async (id = gymId, branch = branchId) => {
    if (!id || !apiBase) return;
    const headers = await headersFor(id);
    const query = branch ? `?branchId=${encodeURIComponent(branch)}` : "";
    const results = await Promise.all([
      fetch(`${apiBase}/api/branches`, { headers, cache: "no-store" }),
      fetch(`${apiBase}/api/members?limit=100&page=1${branch ? `&branchId=${encodeURIComponent(branch)}` : ""}`, { headers, cache: "no-store" }),
      fetch(`${apiBase}/api/plans${query}`, { headers, cache: "no-store" }),
      fetch(`${apiBase}/api/memberships${query}`, { headers, cache: "no-store" }),
      fetch(`${apiBase}/api/attendance${query}`, { headers, cache: "no-store" }),
      fetch(`${apiBase}/api/payments${query}`, { headers, cache: "no-store" })
    ]);
    const bodies = await Promise.all(results.map(r => r.json()));
    const failed = results.findIndex(r => !r.ok);
    if (failed >= 0) throw new Error(bodies[failed]?.error || "Could not load gym operations.");
    setBranches(bodies[0].branches || []);
    setMembers(bodies[1].members || []);
    setPlans((bodies[2].plans || []).filter((p: Plan) => p.isActive !== false));
    setMemberships(bodies[3].memberships || []);
    setAttendance(bodies[4].attendance || []);
    setPayments(bodies[5].payments || []);
    setMemberId(current => current && (bodies[1].members || []).some((m: Member) => m._id === current) ? current : (bodies[1].members || [])[0]?._id || "");
    setPlanId(current => current && (bodies[2].plans || []).some((p: Plan) => p._id === current && p.isActive !== false) ? current : (bodies[2].plans || []).find((p: Plan) => p.isActive !== false)?._id || "");
  }, [branchId, gymId, headersFor]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        if (!apiBase) throw new Error("Set NEXT_PUBLIC_API_URL in the Owner app deployment settings.");
        const token = await getToken();
        if (!token) throw new Error("Please sign in again.");
        const response = await fetch(`${apiBase}/api/workspaces`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Could not load workspaces.");
        if (cancelled) return;
        const list: Workspace[] = body.workspaces || [];
        setWorkspaces(list);
        setGymId(list[0]?.gym?._id || list[0]?.gym?.id || "");
      } catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : "Could not load workspace."); }
    })();
    return () => { cancelled = true; };
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!gymId || !isSignedIn || !apiBase) return;
    let cancelled = false;
    (async () => {
      try { setError(""); await refresh(gymId, branchId); }
      catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : "Could not load data."); }
    })();
    return () => { cancelled = true; };
  }, [gymId, branchId, isSignedIn, refresh]);

  const runAction = async (path: string, payload: unknown, success: string) => {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`${apiBase}${path}`, { method: "POST", headers: await headersFor(), body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Action failed.");
      setMessage(success);
      await refresh(gymId, branchId);
    } catch (e) { setError(e instanceof Error ? e.message : "Action failed."); }
    finally { setBusy(false); }
  };
  const selectedPlan = useMemo(() => plans.find(p => p._id === planId), [plans, planId]);
  const money = (paise?: number) => typeof paise === "number" ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(paise / 100) : "—";
  const memberName = (row: RecordRow) => typeof row.memberId === "object" && row.memberId ? row.memberId.fullName || "Member" : "Member";

  if (!isLoaded) return <main style={{ maxWidth: 1100, margin: "40px auto", padding: 20 }}>Loading session…</main>;
  if (!isSignedIn) return <main style={{ maxWidth: 1100, margin: "40px auto", padding: 20 }}><h1>Sign in required</h1><Link href="/sign-in">Sign in to manage your gym</Link></main>;

  return <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 60px", color: "var(--foreground, #111827)" }}>
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
      <div><Link href="/" style={{ color: "#2563eb", textDecoration: "none" }}>← Dashboard</Link><h1 style={{ fontSize: 30, fontWeight: 800, margin: "10px 0 4px" }}>Gym operations</h1><p style={{ margin: 0, opacity: .7 }}>Enroll members, record fees and manage daily attendance.</p></div>
      <div style={{ minWidth: 220 }}><label style={label}>Gym workspace</label><select style={field} value={gymId} onChange={e => setGymId(e.target.value)}>{workspaces.map(w => <option key={w.gym._id || w.gym.id} value={w.gym._id || w.gym.id}>{w.gym.name}</option>)}</select></div>
    </header>
    {error && <div role="alert" style={{ padding: 12, borderRadius: 9, background: "#fee2e2", color: "#991b1b", marginBottom: 14 }}>{error}</div>}
    {message && <div role="status" style={{ padding: 12, borderRadius: 9, background: "#dcfce7", color: "#166534", marginBottom: 14 }}>{message}</div>}
    <div style={{ ...card, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 }}><label style={{ ...label, margin: 0 }}>Branch</label><select style={{ ...field, width: "auto", minWidth: 220 }} value={branchId} onChange={e => setBranchId(e.target.value)}><option value="">All accessible branches</option>{branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}</select><span style={{ opacity: .7, fontSize: 13 }}>Records are scoped by your signed-in account and permitted branches.</span></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
      <section style={card}><h2 style={{ marginTop: 0 }}>Enroll in a plan</h2><p style={{ opacity: .7, fontSize: 13 }}>Select a member and active plan for the chosen branch.</p><label style={label}>Member</label><select style={field} value={memberId} onChange={e => setMemberId(e.target.value)}><option value="">Choose member</option>{members.map(m => <option key={m._id} value={m._id}>{m.fullName} · {m.memberCode}</option>)}</select><label style={{ ...label, marginTop: 12 }}>Membership plan</label><select style={field} value={planId} onChange={e => setPlanId(e.target.value)}><option value="">Choose plan</option>{plans.map(p => <option key={p._id} value={p._id}>{p.name} · {money(p.pricePaise)} / {p.durationDays} days</option>)}</select>{selectedPlan && <p style={{ fontSize: 13, opacity: .7 }}>Plan price: {money(selectedPlan.pricePaise)} · Duration: {selectedPlan.durationDays} days</p>}<label style={{ ...label, marginTop: 12 }}>Start date</label><input style={field} type="date" value={startsAt} onChange={e => setStartsAt(e.target.value)} /><button disabled={busy || !branchId || !memberId || !planId || !startsAt} style={{ ...button, width: "100%", marginTop: 14, opacity: busy || !branchId || !memberId || !planId ? .55 : 1 }} onClick={() => runAction("/api/memberships", { branchId, memberId, planId, startsAt: new Date(startsAt + "T00:00:00.000Z").toISOString() }, "Membership enrollment saved.")}>Enroll member</button><small style={{ display: "block", marginTop: 8, opacity: .65 }}>Choose a specific branch before enrolling.</small></section>
      <section style={card}><h2 style={{ marginTop: 0 }}>Record a fee payment</h2><p style={{ opacity: .7, fontSize: 13 }}>Creates an append-only payment record; this does not verify bank/UPI settlement.</p><label style={label}>Member</label><select style={field} value={memberId} onChange={e => setMemberId(e.target.value)}><option value="">Choose member</option>{members.map(m => <option key={m._id} value={m._id}>{m.fullName} · {m.memberCode}</option>)}</select><label style={{ ...label, marginTop: 12 }}>Amount (₹)</label><input style={field} type="number" min="0.01" step="0.01" placeholder="e.g. 1200" value={amount} onChange={e => setAmount(e.target.value)} /><label style={{ ...label, marginTop: 12 }}>Payment method</label><select style={field} value={method} onChange={e => setMethod(e.target.value)}>{["cash","upi","bank_transfer","card","other"].map(x => <option key={x} value={x}>{x.replace("_", " ")}</option>)}</select><label style={{ ...label, marginTop: 12 }}>Reference (optional)</label><input style={field} value={reference} onChange={e => setReference(e.target.value)} maxLength={120} placeholder="Receipt / transaction reference" /><label style={{ ...label, marginTop: 12 }}>Note (optional)</label><input style={field} value={note} onChange={e => setNote(e.target.value)} maxLength={500} placeholder="Payment note" /><button disabled={busy || !branchId || !memberId || !Number.isFinite(Number(amount)) || Number(amount) <= 0} style={{ ...button, width: "100%", marginTop: 14 }} onClick={() => runAction("/api/payments", { branchId, memberId, amountPaise: Math.round(Number(amount) * 100), method, reference, note }, "Payment record saved.")}>Record payment</button></section>
      <section style={card}><h2 style={{ marginTop: 0 }}>Attendance check-in</h2><p style={{ opacity: .7, fontSize: 13 }}>Check in active members. A check-out action appears for open sessions.</p><label style={label}>Member</label><select style={field} value={memberId} onChange={e => setMemberId(e.target.value)}><option value="">Choose member</option>{members.filter(m => m.status === "active").map(m => <option key={m._id} value={m._id}>{m.fullName} · {m.memberCode}</option>)}</select><button disabled={busy || !branchId || !memberId} style={{ ...button, width: "100%", marginTop: 14 }} onClick={() => runAction("/api/attendance/check-in", { branchId, memberId }, "Attendance check-in recorded.")}>Check in member</button><small style={{ display: "block", marginTop: 8, opacity: .65 }}>Duplicate open check-ins are rejected by the API.</small></section>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginTop: 18 }}>
      <section style={card}><h2 style={{ marginTop: 0 }}>Recent memberships <span style={{ opacity: .55, fontSize: 13 }}>({memberships.length})</span></h2>{memberships.length === 0 ? <p style={{ opacity: .65 }}>No enrollments yet.</p> : <div style={{ display: "grid", gap: 10 }}>{memberships.slice(0, 8).map(row => <div key={row._id} style={{ borderBottom: "1px solid var(--border, #e5e7eb)", paddingBottom: 9 }}><b>{memberName(row)}</b><div style={{ fontSize: 13, opacity: .7 }}>{row.planNameSnapshot || "Membership"} · {row.status || "active"}</div></div>)}</div>}</section>
      <section style={card}><h2 style={{ marginTop: 0 }}>Today’s attendance <span style={{ opacity: .55, fontSize: 13 }}>({attendance.length})</span></h2>{attendance.length === 0 ? <p style={{ opacity: .65 }}>No attendance records for this filter.</p> : <div style={{ display: "grid", gap: 10 }}>{attendance.slice(0, 10).map(row => <div key={row._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border, #e5e7eb)", paddingBottom: 9 }}><div><b>{memberName(row)}</b><div style={{ fontSize: 13, opacity: .7 }}>{row.checkedInAt ? new Date(row.checkedInAt).toLocaleTimeString() : ""} · {row.checkedOutAt ? "Checked out" : "Checked in"}</div></div>{!row.checkedOutAt && <button disabled={busy || !branchId} style={{ ...button, padding: "7px 10px", fontSize: 12 }} onClick={() => runAction(`/api/attendance/${row._id}/check-out`, {}, "Member checked out.")}>Check out</button>}</div>)}</div>}</section>
      <section style={card}><h2 style={{ marginTop: 0 }}>Recent payments <span style={{ opacity: .55, fontSize: 13 }}>({payments.length})</span></h2>{payments.length === 0 ? <p style={{ opacity: .65 }}>No payment records yet.</p> : <div style={{ display: "grid", gap: 10 }}>{payments.slice(0, 10).map(row => <div key={row._id} style={{ borderBottom: "1px solid var(--border, #e5e7eb)", paddingBottom: 9 }}><b>{money(row.amountPaise)}</b><div style={{ fontSize: 13, opacity: .7 }}>{memberName(row)} · {row.method} · {row.status}</div></div>)}</div>}</section>
    </div>
  </main>;
}
