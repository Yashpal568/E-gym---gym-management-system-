"use client";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

type GymWorkspace = { gym: { _id?: string; id?: string; name: string; slug: string; status: string }; role: string };
type Branch = { _id: string; name: string; address?: string; phone?: string };
type Member = { _id: string; memberCode: string; fullName: string; phone: string; email?: string; status: string; branchId: string; createdAt?: string };
const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const field: React.CSSProperties = { display: "block", width: "100%", marginTop: 5, padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, boxSizing: "border-box" };

export default function MembersPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [workspaces, setWorkspaces] = useState<GymWorkspace[]>([]);
  const [gymId, setGymId] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [formBranchId, setFormBranchId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const requestHeaders = useCallback(async (selectedGymId: string) => {
    const token = await getToken();
    if (!token) throw new Error("Your session expired. Please sign in again.");
    return { Authorization: `Bearer ${token}`, "x-gym-id": selectedGymId };
  }, [getToken]);

  const loadMembers = useCallback(async (selectedGymId: string, selectedBranchId: string, term: string) => {
    if (!selectedGymId || !apiBase) return;
    const headers = await requestHeaders(selectedGymId);
    const params = new URLSearchParams({ limit: "50", page: "1" });
    if (selectedBranchId) params.set("branchId", selectedBranchId);
    if (term.trim()) params.set("search", term.trim());
    const response = await fetch(`${apiBase}/api/members?${params.toString()}`, { headers, cache: "no-store" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Could not load members.");
    setMembers(body.members || []);
  }, [requestHeaders]);

  const loadWorkspaceData = useCallback(async (selectedGymId: string, term = search) => {
    if (!selectedGymId) return;
    const headers = await requestHeaders(selectedGymId);
    const branchResponse = await fetch(`${apiBase}/api/branches`, { headers, cache: "no-store" });
    const branchBody = await branchResponse.json();
    if (!branchResponse.ok) throw new Error(branchBody.error || "Could not load branches.");
    const branchList: Branch[] = branchBody.branches || [];
    setBranches(branchList);
    setFormBranchId(current => current && branchList.some(b => b._id === current) ? current : branchList[0]?._id || "");
    await loadMembers(selectedGymId, branchId && branchList.some(b => b._id === branchId) ? branchId : "", term);
  }, [branchId, loadMembers, requestHeaders, search]);

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        if (!apiBase) throw new Error("Set NEXT_PUBLIC_API_URL in the Owner app deployment settings.");
        const token = await getToken();
        if (!token) throw new Error("Please sign in again.");
        const response = await fetch(`${apiBase}/api/workspaces`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Could not load workspaces.");
        const list: GymWorkspace[] = body.workspaces || [];
        if (cancelled) return;
        setWorkspaces(list);
        const firstId = list[0]?.gym?._id || list[0]?.gym?.id || "";
        setGymId(current => current || firstId);
      } catch (err) { if (!cancelled) setError(err instanceof Error ? err.message : "Could not load gym workspaces."); }
    })();
    return () => { cancelled = true; };
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (!gymId || !isSignedIn || !apiBase) return;
    let cancelled = false;
    (async () => {
      try {
        setError("");
        const token = await getToken();
        if (!token) throw new Error("Please sign in again.");
        const headers = { Authorization: `Bearer ${token}`, "x-gym-id": gymId };
        const response = await fetch(`${apiBase}/api/branches`, { headers, cache: "no-store" });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Could not load branches.");
        const list: Branch[] = body.branches || [];
        if (cancelled) return;
        setBranches(list);
        setFormBranchId(current => current && list.some(b => b._id === current) ? current : list[0]?._id || "");
        const params = new URLSearchParams({ page: "1", limit: "50" });
        if (branchId && list.some(b => b._id === branchId)) params.set("branchId", branchId);
        if (search.trim()) params.set("search", search.trim());
        const memberResponse = await fetch(`${apiBase}/api/members?${params.toString()}`, { headers, cache: "no-store" });
        const memberBody = await memberResponse.json();
        if (!memberResponse.ok) throw new Error(memberBody.error || "Could not load members.");
        if (!cancelled) setMembers(memberBody.members || []);
      } catch (err) { if (!cancelled) setError(err instanceof Error ? err.message : "Could not load member data."); }
    })();
    return () => { cancelled = true; };
  }, [gymId, branchId, search, isSignedIn, getToken]);

  async function createMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      if (!gymId || !formBranchId) throw new Error("Create a gym workspace and branch before adding members.");
      const headers = await requestHeaders(gymId);
      const response = await fetch(`${apiBase}/api/members`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ branchId: formBranchId, memberCode: code.trim(), fullName: name.trim(), phone: phone.trim(), email: email.trim() })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not create member.");
      setMessage(`Member ${body.member.fullName} was added.`);
      setName(""); setCode(""); setPhone(""); setEmail("");
      await loadMembers(gymId, branchId, search);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not create member."); }
    finally { setBusy(false); }
  }

  if (!isLoaded) return <main style={{ padding: 24 }}>Loading secure session…</main>;
  if (!isSignedIn) return <main style={{ maxWidth: 650, margin: "8vh auto", padding: 24 }}><h1>Sign in required</h1><p>Sign in to view or manage gym members.</p><Link href="/sign-in">Continue to sign in</Link></main>;
  return <main style={{ maxWidth: 1100, margin: "3vh auto", padding: 24, fontFamily: "Arial, sans-serif" }}>
    <p><Link href="/">← Dashboard</Link></p>
    <h1>Members</h1><p>Manage member records in your selected gym workspace.</p>
    {error && <p role="alert" style={{ padding: 12, borderRadius: 8, background: "#fee2e2", color: "#991b1b" }}>{error}</p>}
    {message && <p role="status" style={{ padding: 12, borderRadius: 8, background: "#dcfce7", color: "#166534" }}>{message}</p>}
    {workspaces.length > 1 && <label>Gym workspace<select value={gymId} onChange={e => { setGymId(e.target.value); setBranchId(""); }} style={field}>{workspaces.map(w => { const id = w.gym._id || w.gym.id || ""; return <option key={id} value={id}>{w.gym.name}</option>; })}</select></label>}
    {workspaces.length === 0 && <p>No workspace found. <Link href="/onboarding">Set up your gym</Link> first.</p>}
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20, marginTop: 20 }}>
      <form onSubmit={createMember} style={{ padding: 18, border: "1px solid #d1d5db", borderRadius: 14, display: "grid", gap: 12, alignContent: "start" }}>
        <h2 style={{ margin: 0 }}>Add a member</h2>
        <label>Member code<input required minLength={1} maxLength={32} value={code} onChange={e => setCode(e.target.value)} style={field} placeholder="e.g. MEM-001"/></label>
        <label>Full name<input required minLength={2} maxLength={120} value={name} onChange={e => setName(e.target.value)} style={field}/></label>
        <label>Phone<input required minLength={5} maxLength={24} value={phone} onChange={e => setPhone(e.target.value)} style={field}/></label>
        <label>Email (optional)<input type="email" value={email} maxLength={254} onChange={e => setEmail(e.target.value)} style={field}/></label>
        <label>Branch<select required value={formBranchId} onChange={e => setFormBranchId(e.target.value)} style={field}><option value="">Select branch</option>{branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}</select></label>
        <button disabled={busy || !gymId || !formBranchId} type="submit" style={{ padding: 12, border: 0, borderRadius: 9, background: "#4338ca", color: "#fff", fontWeight: 700 }}>{busy ? "Saving…" : "Add member"}</button>
      </form>
      <section style={{ minWidth: 0, padding: 18, border: "1px solid #d1d5db", borderRadius: 14 }}>
        <h2 style={{ marginTop: 0 }}>Member directory</h2>
        <label>Search members<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, code or phone" style={field}/></label>
        <label>Filter by branch<select value={branchId} onChange={e => setBranchId(e.target.value)} style={field}><option value="">All accessible branches</option>{branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}</select></label>
        {members.length === 0 ? <p>No members match this view yet.</p> : <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12, textAlign: "left" }}><thead><tr>{["Member","Code","Phone","Status"].map(h => <th key={h} style={{ padding: 9, borderBottom: "1px solid #cbd5e1" }}>{h}</th>)}</tr></thead><tbody>{members.map(m => <tr key={m._id}><td style={{ padding: 9, borderBottom: "1px solid #e2e8f0" }}>{m.fullName}</td><td style={{ padding: 9, borderBottom: "1px solid #e2e8f0" }}>{m.memberCode}</td><td style={{ padding: 9, borderBottom: "1px solid #e2e8f0" }}>{m.phone}</td><td style={{ padding: 9, borderBottom: "1px solid #e2e8f0" }}>{m.status}</td></tr>)}</tbody></table></div>}
      </section>
    </section>
  </main>;
}
