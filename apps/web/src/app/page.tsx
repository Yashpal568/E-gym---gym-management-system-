"use client";
import { Activity, ArrowDownRight, ArrowUpRight, Bell, CalendarCheck, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, Dumbbell, Plus, Users, WalletCards } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
const stats = [
  { label: "Total members", value: "—", note: "Connect your gym to load data", icon: Users, tone: "blue" },
  { label: "Fees collected", value: "—", note: "Verified payments only", icon: CircleDollarSign, tone: "green" },
  { label: "Attendance today", value: "—", note: "Today's check-ins", icon: CalendarCheck, tone: "violet" },
  { label: "Renewals due", value: "—", note: "Upcoming memberships", icon: Clock3, tone: "amber" }
];
const tasks = ["Complete gym profile", "Add your first branch", "Create membership plans", "Configure fees and receipts", "Add your first member"];
export default function Home() {
  return <main className="shell">
    <aside className="sidebar">
      <a className="brand" href="#"><span className="brand-mark"><Dumbbell size={21}/></span><span>Gym<span className="brand-accent">Sphere</span><small>GYM MANAGEMENT</small></span></a>
      <div className="workspace-label">WORKSPACE</div>
      <a className="nav-item active" href="#"><Activity size={18}/> Overview</a>
      <a className="nav-item" href="#members"><Users size={18}/> Members <span className="nav-soon">Setup</span></a>
      <a className="nav-item" href="#memberships"><WalletCards size={18}/> Memberships</a>
      <a className="nav-item" href="#attendance"><CalendarCheck size={18}/> Attendance</a>
      <a className="nav-item" href="#payments"><CircleDollarSign size={18}/> Fees & payments</a>
      <a className="nav-item" href="#reminders"><Bell size={18}/> Reminders</a>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CheckCircle2 size={18}/></div><b>Let’s set up your gym</b><p>Follow the checklist to get your workspace ready.</p><a href="#setup">Continue setup <ChevronRight size={14}/></a></div><div className="profile"><div className="avatar">GY</div><div><b>Gym Owner</b><small>Workspace setup</small></div><ChevronRight size={16}/></div></div>
    </aside>
    <section className="main-panel">
      <header className="topbar"><div className="crumb">Workspace <ChevronRight size={14}/> <b>Overview</b></div><div className="top-actions"><span className="status-pill"><span/> Setup mode</span><button className="icon-button" aria-label="Notifications"><Bell size={18}/></button><ThemeToggle/></div></header>
      <div className="content">
        <div className="welcome-row"><div><p className="eyebrow">YOUR GYM, ONE WORKSPACE</p><h1>Good to see you 👋</h1><p className="subtitle">Let’s get your gym ready. Your live metrics will appear here once your account is connected.</p></div><button className="primary-button" onClick={() => document.getElementById("setup")?.scrollIntoView({behavior:"smooth"})}><Plus size={17}/> Set up your gym</button></div>
        <div className="notice"><div className="notice-symbol"><Activity size={19}/></div><div><b>Your workspace is ready to configure</b><p>This is the first deployable UI. Real member, payment and attendance data will only appear after authentication and the API/database are configured.</p></div><span className="notice-tag">Getting started</span></div>
        <div className="section-heading"><div><h2>Gym overview</h2><p>A snapshot of your gym’s activity</p></div><span className="period-chip">Today <ChevronRight size={14}/></span></div>
        <div className="stats-grid">{stats.map(({label,value,note,icon:Icon,tone})=><article className="stat-card" key={label}><div className="stat-top"><span>{label}</span><span className={"stat-icon "+tone}><Icon size={18}/></span></div><div className="stat-value">{value}</div><p>{note}</p><div className="stat-foot"><span className="muted-dot"/> Waiting for setup</div></article>)}</div>
        <div className="lower-grid">
          <section className="panel" id="setup"><div className="panel-heading"><div><h2>Get started</h2><p>Complete these steps to unlock your dashboard</p></div><span className="progress-count">0 of 5</span></div><div className="progress-track"><span/></div><div className="task-list">{tasks.map((task,i)=><div className="task" key={task}><span className="task-number">{String(i+1).padStart(2,"0")}</span><span className="task-text"><b>{task}</b><small>{i===0?"Add your gym name, contact details and address":i===1?"Create a location for your members":i===2?"Set monthly, quarterly or annual plans":i===3?"Define how you record and reconcile payments":"Start building your member directory"}</small></span><span className="task-state">Not started</span><ChevronRight size={17}/></div>)}</div><button className="secondary-button" onClick={() => { window.location.href = "/onboarding"; }}>Open setup checklist <ChevronRight size={16}/></button></section>
          <section className="panel activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Important updates from your gym</p></div><span className="live-indicator"><span/> Live feed</span></div><div className="empty-state"><div className="empty-icon"><Activity size={22}/></div><b>No activity yet</b><p>Member check-ins, verified payments and membership changes will appear here.</p></div><div className="security-note"><CheckCircle2 size={16}/><span><b>Financial integrity by design</b><small>Unverified UTR submissions will never count as collected fees.</small></span></div></section>
        </div>
        <footer>GymSphere <span>•</span> Built for gym owners <span>•</span> Secure by design</footer>
      </div>
    </section>
  </main>;
}