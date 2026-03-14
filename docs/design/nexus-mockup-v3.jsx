import { useState } from "react";

// ─── DESIGN TOKENS ───
const T = {
  bg: "#07080d",
  bgCard: "rgba(255,255,255,0.04)",
  bgCardHover: "rgba(255,255,255,0.07)",
  bgGlass: "rgba(255,255,255,0.05)",
  borderGlass: "rgba(255,255,255,0.08)",
  borderGlassHover: "rgba(255,255,255,0.14)",
  text: "#edf0f7",
  textSec: "#8690a6",
  textMuted: "#555d72",
  accent: "#6c63ff",
  accentGlow: "rgba(108,99,255,0.35)",
  green: "#34d399",
  greenGlow: "rgba(52,211,153,0.25)",
  amber: "#fbbf24",
  amberGlow: "rgba(251,191,36,0.2)",
  rose: "#fb7185",
  roseGlow: "rgba(251,113,133,0.2)",
  cyan: "#22d3ee",
  cyanGlow: "rgba(34,211,238,0.2)",
  violet: "#a78bfa",
  violetGlow: "rgba(167,139,250,0.2)",
  blue: "#60a5fa",
};

const glass = {
  background: T.bgGlass,
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: `1px solid ${T.borderGlass}`,
  borderRadius: 16,
};

const glassCard = {
  ...glass,
  boxShadow: "0 4px 30px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
};

// ─── SIDEBAR ───
const navItems = [
  { id: "dashboard", icon: "⬡", label: "Overview", gradient: "linear-gradient(135deg,#6c63ff,#a78bfa)" },
  { id: "docsense", icon: "◎", label: "DocSense", gradient: "linear-gradient(135deg,#3b82f6,#60a5fa)" },
  { id: "medpulse", icon: "♡", label: "MedPulse", gradient: "linear-gradient(135deg,#10b981,#34d399)" },
  { id: "ledger", icon: "◈", label: "Ledger", gradient: "linear-gradient(135deg,#f59e0b,#fbbf24)" },
  { id: "timeline", icon: "◔", label: "Timeline", gradient: "linear-gradient(135deg,#8b5cf6,#a78bfa)" },
  { id: "thread", icon: "◫", label: "Thread", gradient: "linear-gradient(135deg,#06b6d4,#22d3ee)" },
  { id: "vault", icon: "◑", label: "Vault", gradient: "linear-gradient(135deg,#475569,#94a3b8)", wifi: true },
  { id: "gallery", icon: "◧", label: "Gallery", gradient: "linear-gradient(135deg,#e11d48,#fb7185)" },
  { id: "atlas", icon: "✦", label: "Atlas", gradient: "linear-gradient(135deg,#7c3aed,#a78bfa)" },
];

const Sidebar = ({ active, onNav, isHome, view, onView }) => (
  <div style={{ width: 220, minHeight: "100vh", background: "rgba(7,8,13,0.95)", borderRight: `1px solid ${T.borderGlass}`, display: "flex", flexDirection: "column", flexShrink: 0, backdropFilter: "blur(40px)" }}>
    {/* Logo */}
    <div style={{ padding: "24px 20px 20px", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#6c63ff,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${T.accentGlow}` }}>
        <span style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>N</span>
      </div>
      <span style={{ fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: -0.5 }}>Nexus</span>
    </div>

    {/* View Switcher */}
    <div style={{ padding: "0 12px", marginBottom: 8 }}>
      <div style={{ ...glassCard, borderRadius: 12, padding: 4, display: "flex", gap: 2 }}>
        {[{ id: "admin", label: "Admin" }, { id: "family", label: "Family" }, { id: "friends", label: "Friends" }, { id: "guest", label: "Guest" }].map(v => (
          <button key={v.id} onClick={() => onView(v.id)} style={{
            flex: 1, padding: "6px 0", borderRadius: 9, border: "none", fontSize: 10, fontWeight: 600,
            background: view === v.id ? "linear-gradient(135deg,#6c63ff,#a78bfa)" : "transparent",
            color: view === v.id ? "#fff" : T.textMuted, cursor: "pointer", transition: "all 0.2s",
            boxShadow: view === v.id ? `0 2px 8px ${T.accentGlow}` : "none",
          }}>{v.label}</button>
        ))}
      </div>
    </div>

    {/* Nav */}
    <div style={{ flex: 1, padding: "8px 8px", display: "flex", flexDirection: "column", gap: 1 }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted, letterSpacing: 2, textTransform: "uppercase", padding: "14px 12px 6px" }}>
        {view === "admin" ? "Administration" : view === "family" ? "Family Space" : view === "friends" ? "Friend Group" : "Portfolio"}
      </div>
      {view === "guest" ? (
        ["Project Showcase", "Architecture", "Tech Stack", "Live Status"].map((item, i) => (
          <button key={i} onClick={() => onNav("guest")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: "none", background: i === 0 ? "rgba(108,99,255,0.1)" : "transparent", cursor: "pointer" }}>
            <span style={{ fontSize: 13, color: i === 0 ? T.accent : T.textMuted }}>{"◎◇◈◉"[i]}</span>
            <span style={{ fontSize: 12, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? T.text : T.textSec }}>{item}</span>
          </button>
        ))
      ) : view === "friends" ? (
        <>
          {["Feed", "Calendar", "Split Expenses", "Group Chat"].map((item, i) => (
            <button key={i} onClick={() => onNav(i === 0 ? "friends_feed" : "friends_feed")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: "none", background: i === 0 ? "rgba(34,211,238,0.08)" : "transparent", cursor: "pointer" }}>
              <span style={{ fontSize: 13, color: i === 0 ? T.cyan : T.textMuted }}>{"◫◔◈◫"[i]}</span>
              <span style={{ fontSize: 12, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? T.text : T.textSec }}>{item}</span>
            </button>
          ))}
          <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted, letterSpacing: 2, padding: "16px 12px 6px" }}>GROUPS</div>
          {["College Friends", "Work Team", "Gym Buddies"].map((g, i) => (
            <button key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, border: "none", background: i === 0 ? "rgba(255,255,255,0.04)" : "transparent", cursor: "pointer" }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: `linear-gradient(135deg, ${["#06b6d4", "#8b5cf6", "#f59e0b"][i]}40, ${["#06b6d4", "#8b5cf6", "#f59e0b"][i]}20)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: ["#22d3ee", "#a78bfa", "#fbbf24"][i] }}>{g[0]}</div>
              <span style={{ fontSize: 12, color: i === 0 ? T.text : T.textSec }}>{g}</span>
            </button>
          ))}
        </>
      ) : (
        <>
          {navItems.map(item => {
            const isActive = active === item.id;
            const locked = item.wifi && !isHome;
            if (view !== "admin" && item.id === "vault") return null;
            return (
              <button key={item.id} onClick={() => !locked && onNav(item.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10,
                border: "none", background: isActive ? "rgba(108,99,255,0.1)" : "transparent",
                cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.3 : 1, position: "relative",
              }}>
                {isActive && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: 2, background: T.accent, boxShadow: `0 0 8px ${T.accentGlow}` }} />}
                <span style={{ fontSize: 14, color: isActive ? T.accent : T.textMuted }}>{item.icon}</span>
                <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? T.text : T.textSec }}>{item.label}</span>
                {locked && <span style={{ marginLeft: "auto", fontSize: 10 }}>🔒</span>}
              </button>
            );
          })}
          {view === "admin" && (
            <>
              <div style={{ height: 1, background: T.borderGlass, margin: "8px 12px" }} />
              <button onClick={() => onNav("console")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: "none", background: active === "console" ? "rgba(220,38,38,0.1)" : "transparent", cursor: isHome ? "pointer" : "not-allowed", opacity: isHome ? 1 : 0.3 }}>
                {active === "console" && <div style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: 2, background: T.rose }} />}
                <span style={{ fontSize: 14, color: active === "console" ? T.rose : T.textMuted }}>⬡</span>
                <span style={{ fontSize: 12, fontWeight: active === "console" ? 600 : 400, color: active === "console" ? T.text : T.textSec }}>Console</span>
                {!isHome && <span style={{ marginLeft: "auto", fontSize: 10 }}>🔒</span>}
              </button>
            </>
          )}
        </>
      )}
    </div>

    {/* User */}
    <div style={{ padding: "16px 14px", borderTop: `1px solid ${T.borderGlass}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#6c63ff,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>S</div>
        <div><div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Sriram</div><div style={{ fontSize: 10, color: T.textMuted }}>Admin</div></div>
      </div>
    </div>
  </div>
);

// ─── HEADER ───
const Header = ({ title, isHome, onToggle, gradient }) => (
  <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", borderBottom: `1px solid ${T.borderGlass}` }}>
    <span style={{ fontSize: 17, fontWeight: 700, color: T.text, letterSpacing: -0.3 }}>{title}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 20, background: isHome ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)", border: `1px solid ${isHome ? "rgba(52,211,153,0.25)" : "rgba(251,191,36,0.25)"}`, color: isHome ? T.green : T.amber, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: isHome ? T.green : T.amber, boxShadow: `0 0 8px ${isHome ? T.greenGlow : T.amberGlow}` }} />
        {isHome ? "Home Network" : "Remote"}
      </button>
      <div style={{ width: 34, height: 34, borderRadius: 10, ...glassCard, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer" }}>🔔</div>
    </div>
  </div>
);

// ─── STAT CARD ───
const StatCard = ({ label, value, sub, gradient, icon, glow }) => (
  <div style={{ ...glassCard, padding: "20px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: glow, filter: "blur(30px)", opacity: 0.5 }} />
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 500, letterSpacing: 0.5, marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: T.text, letterSpacing: -1.5 }}>{value}</div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: `0 4px 12px ${glow}` }}>{icon}</div>
      </div>
      <div style={{ fontSize: 11, color: T.green, fontWeight: 500, marginTop: 8 }}>{sub}</div>
    </div>
  </div>
);

// ─── DASHBOARD (Admin View) ───
const DashboardScreen = () => (
  <div style={{ padding: "24px 28px" }}>
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 13, color: T.textMuted }}>Welcome back</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: -1 }}>Command Center</div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
      <StatCard label="DOCUMENTS" value="47" sub="↑ 3 this week" gradient="linear-gradient(135deg,#3b82f6,#60a5fa)" icon="◎" glow="rgba(59,130,246,0.3)" />
      <StatCard label="ADHERENCE" value="96%" sub="All members" gradient="linear-gradient(135deg,#10b981,#34d399)" icon="♡" glow={T.greenGlow} />
      <StatCard label="MONTHLY" value="₹24.5k" sub="↓ 12% vs last" gradient="linear-gradient(135deg,#f59e0b,#fbbf24)" icon="◈" glow={T.amberGlow} />
      <StatCard label="PHOTOS" value="312" sub="↑ 28 new" gradient="linear-gradient(135deg,#e11d48,#fb7185)" icon="◧" glow={T.roseGlow} />
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {/* Schedule */}
      <div style={{ ...glassCard, padding: "22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Today</span>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(108,99,255,0.12)", color: T.accent, fontWeight: 600 }}>4 events</span>
        </div>
        {[
          { time: "8:00", text: "Amoxicillin 500mg", who: "Mom", color: T.green, done: true },
          { time: "9:30", text: "Electricity bill due", who: "₹1,850", color: T.amber },
          { time: "2:00", text: "Metformin 850mg", who: "Dad", color: T.green },
          { time: "4:00", text: "Parent meeting", who: "School", color: T.violet },
        ].map((ev, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderTop: i ? `1px solid ${T.borderGlass}` : "none" }}>
            <span style={{ width: 40, fontSize: 11, color: T.textMuted, fontFamily: "monospace" }}>{ev.time}</span>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: ev.done ? T.borderGlass : ev.color, boxShadow: ev.done ? "none" : `0 0 8px ${ev.color}40` }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: ev.done ? T.textMuted : T.text, textDecoration: ev.done ? "line-through" : "none" }}>{ev.text}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{ev.who}</div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Digest */}
      <div style={{ ...glassCard, padding: "22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>AI Digest</span>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(167,139,250,0.12)", color: T.violet, fontWeight: 600 }}>Cortex</span>
        </div>
        <div style={{ ...glass, borderRadius: 12, padding: "16px", borderLeft: `3px solid ${T.violet}`, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>
            Mom's prescription processed — <span style={{ color: T.green, fontWeight: 600 }}>Amoxicillin 500mg</span> added with 3x daily reminders. Dad logged <span style={{ color: T.amber, fontWeight: 600 }}>₹2,400</span> groceries. School fee due in 3 days. 4 new photos shared.
          </div>
        </div>
        {["Mom uploaded prescription", "Cortex: 3 medications extracted", "Dad: expense ₹2,400", "Push sent to Mom"].map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", fontSize: 12, color: T.textSec }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.accent, opacity: 0.5 }} />
            {a}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── CONSOLE ───
const ConsoleScreen = () => (
  <div style={{ padding: "24px 28px" }}>
    <div style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 20, letterSpacing: -0.5 }}>System Console</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
      {[
        { label: "CPU", value: "23%", color: T.green, glow: T.greenGlow },
        { label: "Memory", value: "3.2 / 4.5 GB", color: T.amber, glow: T.amberGlow },
        { label: "Disk", value: "67%", color: T.accent, glow: T.accentGlow },
        { label: "Uptime", value: "14d 6h", color: T.cyan, glow: T.cyanGlow },
      ].map((s, i) => (
        <div key={i} style={{ ...glassCard, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", bottom: -10, right: -10, width: 50, height: 50, borderRadius: "50%", background: s.glow, filter: "blur(20px)" }} />
          <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>{s.label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: -0.5, position: "relative" }}>{s.value}</div>
        </div>
      ))}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div style={{ ...glassCard, padding: "20px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14 }}>Containers</div>
        {[
          { name: "nexus-api", tech: "Java", ram: "487MB", up: true },
          { name: "cortex-service", tech: "Python", ram: "162MB", up: true },
          { name: "thread-service", tech: "Node.js", ram: "134MB", up: true },
          { name: "postgres", tech: "", ram: "241MB", up: true },
          { name: "redis", tech: "", ram: "58MB", up: true },
          { name: "ollama", tech: "", ram: "89MB", up: "idle" },
          { name: "grafana", tech: "", ram: "198MB", up: true },
        ].map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: i ? `1px solid ${T.borderGlass}` : "none" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.up === true ? T.green : T.amber, boxShadow: `0 0 6px ${c.up === true ? T.greenGlow : T.amberGlow}` }} />
            <span style={{ fontSize: 12, color: T.text, fontFamily: "'JetBrains Mono', monospace", flex: 1 }}>{c.name}</span>
            {c.tech && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,0.06)", color: T.textMuted, fontWeight: 600 }}>{c.tech}</span>}
            <span style={{ fontSize: 11, color: T.textMuted, fontFamily: "monospace", width: 50, textAlign: "right" }}>{c.ram}</span>
          </div>
        ))}
      </div>

      <div style={{ ...glassCard, padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Live Logs</span>
          <div style={{ display: "flex", gap: 3 }}>
            {["ALL", "ERR", "WARN"].map((f, i) => (
              <button key={i} style={{ padding: "2px 8px", borderRadius: 4, border: `1px solid ${T.borderGlass}`, background: i === 0 ? "rgba(108,99,255,0.15)" : "transparent", color: i === 0 ? T.accent : T.textMuted, fontSize: 9, cursor: "pointer", fontWeight: 600 }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, lineHeight: 2 }}>
          {[
            { l: "INFO", c: T.green, t: "User 'Mom' authenticated" },
            { l: "INFO", c: T.cyan, t: "Cortex: OCR completed 2.3s" },
            { l: "INFO", c: T.cyan, t: "Cortex: 3 entities extracted" },
            { l: "WARN", c: T.amber, t: "Ollama loading tinyllama" },
            { l: "INFO", c: T.green, t: "MedPulse: 3 schedules created" },
            { l: "INFO", c: T.green, t: "Push notification sent" },
            { l: "INFO", c: T.green, t: "Backup completed: 1.8GB" },
          ].map((l, i) => (
            <div key={i} style={{ color: T.textMuted }}>
              <span style={{ color: l.c, fontWeight: 700 }}>{l.l}</span>
              <span style={{ color: T.textMuted, opacity: 0.3 }}> │ </span>
              <span>{l.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── THREAD ───
const ThreadScreen = () => (
  <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>
    <div style={{ width: 250, borderRight: `1px solid ${T.borderGlass}`, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
      <input placeholder="Search..." style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${T.borderGlass}`, background: T.bgGlass, color: T.text, fontSize: 12, outline: "none", marginBottom: 8 }} />
      {[{ name: "Family Chat", preview: "Mom: uploaded prescription", unread: 3, active: true }, { name: "Mom", preview: "Thanks!" }, { name: "Dad", preview: "Bill paid" }].map((c, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", borderRadius: 12, background: c.active ? "rgba(108,99,255,0.08)" : "transparent", cursor: "pointer", border: c.active ? `1px solid rgba(108,99,255,0.15)` : "1px solid transparent" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: c.active ? "linear-gradient(135deg,#06b6d4,#22d3ee)" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: c.active ? "#fff" : T.textMuted, fontSize: 14, fontWeight: 700, flexShrink: 0, boxShadow: c.active ? `0 4px 12px ${T.cyanGlow}` : "none" }}>{c.name[0]}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: c.active ? 600 : 400, color: T.text }}>{c.name}</div>
            <div style={{ fontSize: 11, color: T.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.preview}</div>
          </div>
          {c.unread && <div style={{ width: 18, height: 18, borderRadius: "50%", background: T.cyan, color: "#000", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{c.unread}</div>}
        </div>
      ))}
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>
        {[
          { from: "Mom", text: "Uploaded the prescription from today", time: "9:15 AM" },
          { from: "sys", text: "📄 DocSense processed: Amoxicillin 500mg extracted. 3 dose schedules created in MedPulse.", time: "9:16 AM" },
          { from: "me", text: "Got it! Reminders set for 8am, 2pm, 8pm", time: "9:20 AM" },
          { from: "Dad", text: "Paid the electricity bill", time: "10:30 AM", ref: { title: "Electricity — Feb", val: "₹1,850" } },
        ].map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.from === "me" ? "flex-end" : "flex-start", marginBottom: 14, gap: 8 }}>
            {msg.from !== "me" && msg.from !== "sys" && (
              <div style={{ width: 30, height: 30, borderRadius: 10, background: "linear-gradient(135deg,#6c63ff40,#a78bfa40)", display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, fontSize: 11, fontWeight: 700, marginTop: 2 }}>{msg.from[0]}</div>
            )}
            <div style={{ maxWidth: "65%" }}>
              {msg.from !== "me" && msg.from !== "sys" && <div style={{ fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 3 }}>{msg.from}</div>}
              <div style={{
                padding: "10px 16px", fontSize: 13, lineHeight: 1.6,
                borderRadius: msg.from === "sys" ? 12 : msg.from === "me" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                background: msg.from === "sys" ? "rgba(255,255,255,0.03)" : msg.from === "me" ? "linear-gradient(135deg,#6c63ff,#8b5cf6)" : T.bgGlass,
                color: msg.from === "sys" ? T.textMuted : msg.from === "me" ? "#fff" : T.text,
                border: msg.from === "sys" ? `1px solid ${T.borderGlass}` : msg.from === "me" ? "none" : `1px solid ${T.borderGlass}`,
                borderLeft: msg.from === "sys" ? `3px solid ${T.textMuted}` : undefined,
                boxShadow: msg.from === "me" ? `0 2px 12px ${T.accentGlow}` : "none",
              }}>
                {msg.text}
                {msg.ref && (
                  <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 10, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>💰</span>
                    <div><div style={{ fontSize: 12, fontWeight: 600, color: T.amber }}>{msg.ref.title}</div><div style={{ fontSize: 11, color: T.textMuted }}>{msg.ref.val}</div></div>
                  </div>
                )}
              </div>
              <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4, textAlign: msg.from === "me" ? "right" : "left" }}>{msg.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "12px 24px 16px", borderTop: `1px solid ${T.borderGlass}`, display: "flex", gap: 8 }}>
        <button style={{ width: 36, height: 36, borderRadius: 10, ...glassCard, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer" }}>+</button>
        <input placeholder="Message..." style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.borderGlass}`, background: T.bgGlass, color: T.text, fontSize: 13, outline: "none" }} />
        <button style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#06b6d4,#22d3ee)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#000", fontWeight: 800, boxShadow: `0 2px 10px ${T.cyanGlow}` }}>↑</button>
      </div>
    </div>
  </div>
);

// ─── ATLAS ───
const AtlasScreen = () => (
  <div style={{ padding: "24px 28px" }}>
    <div style={{ maxWidth: 660, margin: "40px auto 0" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: -0.5 }}>Ask Nexus</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 6 }}>Search across all family data with natural language</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        <input defaultValue="When does Dad's insurance expire?" style={{ flex: 1, padding: "14px 18px", borderRadius: 14, border: `2px solid ${T.violet}`, background: T.bgGlass, color: T.text, fontSize: 14, outline: "none", boxShadow: `0 0 20px ${T.violetGlow}` }} />
        <button style={{ padding: "14px 24px", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", border: "none", borderRadius: 14, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 16px ${T.violetGlow}` }}>Search</button>
      </div>
      <div style={{ ...glassCard, padding: "24px", marginBottom: 16, borderLeft: `3px solid ${T.violet}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 24, height: 24, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✦</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.violet }}>Nexus AI</span>
        </div>
        <div style={{ fontSize: 14, color: T.textSec, lineHeight: 1.8 }}>
          Dad's vehicle insurance (<span style={{ color: T.text, fontWeight: 600 }}>HDFC ERGO</span>, policy #INS-2024-8847) expires on <span style={{ color: T.green, fontWeight: 600 }}>September 15, 2026</span>. Coverage period is 12 months from the policy upload date.
        </div>
        <div style={{ ...glass, borderRadius: 10, padding: "10px 14px", marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <span>📄</span>
          <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>Vehicle Insurance Policy</div><div style={{ fontSize: 10, color: T.textMuted }}>Jan 12, 2026 · DocSense</div></div>
          <span style={{ fontSize: 11, color: T.violet, cursor: "pointer" }}>View →</span>
        </div>
      </div>
      {["How much on groceries this month?", "What medication is Mom taking?", "When is school fee due?"].map((q, i) => (
        <div key={i} style={{ ...glassCard, padding: "11px 14px", marginBottom: 6, fontSize: 13, color: T.textSec, cursor: "pointer" }}>
          <span style={{ color: T.violet, marginRight: 8 }}>→</span>{q}
        </div>
      ))}
    </div>
  </div>
);

// ─── GUEST VIEW ───
const GuestScreen = () => (
  <div style={{ padding: "24px 28px" }}>
    <div style={{ textAlign: "center", marginBottom: 36, paddingTop: 20 }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: T.text, letterSpacing: -1 }}>Project Showcase</div>
      <div style={{ fontSize: 14, color: T.textMuted, marginTop: 8 }}>A self-hosted polyglot family operating system</div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
      {[
        { label: "Backend Stacks", value: "3", sub: "Java · Python · Node.js", gradient: "linear-gradient(135deg,#6c63ff,#a78bfa)", glow: T.accentGlow },
        { label: "Sub-Projects", value: "11", sub: "Integrated modules", gradient: "linear-gradient(135deg,#06b6d4,#22d3ee)", glow: T.cyanGlow },
        { label: "Technologies", value: "25+", sub: "End-to-end coverage", gradient: "linear-gradient(135deg,#10b981,#34d399)", glow: T.greenGlow },
      ].map((s, i) => (
        <div key={i} style={{ ...glassCard, padding: "22px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -15, right: -15, width: 60, height: 60, borderRadius: "50%", background: s.glow, filter: "blur(25px)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 36, fontWeight: 800, background: s.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -2 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: T.textSec, marginTop: 4 }}>{s.sub}</div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ ...glassCard, padding: "24px", marginBottom: 14 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 16 }}>Architecture</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
        {[
          { name: "Spring Boot", tech: "Java", color: T.green },
          { name: "FastAPI", tech: "Python", color: T.amber },
          { name: "Socket.io", tech: "Node.js", color: T.cyan },
          { name: "PostgreSQL", tech: "pgvector", color: T.blue },
          { name: "Ollama", tech: "Local AI", color: T.violet },
          { name: "Grafana", tech: "Monitoring", color: T.rose },
        ].map((t, i) => (
          <div key={i} style={{ ...glass, borderRadius: 12, padding: "14px 20px", textAlign: "center", minWidth: 110 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.color }}>{t.name}</div>
            <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>{t.tech}</div>
          </div>
        ))}
      </div>
    </div>
    <div style={{ ...glassCard, padding: "20px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.green, boxShadow: `0 0 10px ${T.greenGlow}`, animation: "pulse 2s infinite" }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>System Online</div>
        <div style={{ fontSize: 11, color: T.textMuted }}>All 12 containers running · Uptime 14d 6h · Last deploy 2h ago</div>
      </div>
    </div>
  </div>
);

// ─── FRIENDS VIEW ───
const FriendsScreen = () => (
  <div style={{ padding: "24px 28px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
      <div>
        <div style={{ fontSize: 12, color: T.cyan }}>College Friends</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: -0.5 }}>Group Feed</div>
      </div>
      <div style={{ display: "flex", gap: -8 }}>
        {["A", "R", "K", "P"].map((m, i) => (
          <div key={i} style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${[T.accent, T.cyan, T.amber, T.rose][i]}80, ${[T.accent, T.cyan, T.amber, T.rose][i]}40)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, border: `2px solid ${T.bg}`, marginLeft: i ? -8 : 0, position: "relative", zIndex: 4 - i }}>{m}</div>
        ))}
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.bgGlass, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontSize: 10, fontWeight: 600, border: `2px solid ${T.bg}`, marginLeft: -8 }}>+2</div>
      </div>
    </div>
    {[
      { author: "Arjun", time: "2h ago", text: "Anyone up for a trip to Coorg next weekend? Found some great homestays!", reactions: ["🔥 4", "👍 2"] },
      { author: "Rahul", time: "5h ago", text: "Splitting dinner from last night — ₹3,200 total for 4 people. Added to expenses.", isExpense: true, amount: "₹800 each" },
      { author: "You", time: "1d ago", text: "Updated the shared calendar with Karthik's birthday party — March 28th, 7PM at his place", isEvent: true },
    ].map((post, i) => (
      <div key={i} style={{ ...glassCard, padding: "18px 20px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${[T.cyan, T.violet, T.accent][i]}, ${[T.cyan, T.violet, T.accent][i]}80)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>{post.author[0]}</div>
          <div style={{ flex: 1 }}><span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{post.author}</span></div>
          <span style={{ fontSize: 11, color: T.textMuted }}>{post.time}</span>
        </div>
        <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6, marginBottom: post.reactions || post.isExpense || post.isEvent ? 12 : 0 }}>{post.text}</div>
        {post.isExpense && (
          <div style={{ ...glass, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 16 }}>💰</span>
            <div><div style={{ fontSize: 12, fontWeight: 600, color: T.amber }}>Dinner Split</div><div style={{ fontSize: 11, color: T.textMuted }}>{post.amount}</div></div>
            <button style={{ marginLeft: "auto", padding: "4px 12px", borderRadius: 8, background: "rgba(251,191,36,0.12)", border: "none", color: T.amber, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Settle Up</button>
          </div>
        )}
        {post.isEvent && (
          <div style={{ ...glass, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>📅</span>
            <div><div style={{ fontSize: 12, fontWeight: 600, color: T.violet }}>Birthday Party</div><div style={{ fontSize: 11, color: T.textMuted }}>Mar 28, 7:00 PM</div></div>
          </div>
        )}
        {post.reactions && (
          <div style={{ display: "flex", gap: 6 }}>
            {post.reactions.map((r, j) => (
              <span key={j} style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderGlass}`, fontSize: 12, color: T.textSec }}>{r}</span>
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
);

// ─── PLACEHOLDER ───
const Placeholder = ({ name, gradient, glow }) => (
  <div style={{ padding: "24px 28px" }}>
    <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 20 }}>{name}</div>
    <div style={{ ...glassCard, padding: "60px", textAlign: "center" }}>
      <div style={{ width: 60, height: 60, borderRadius: 16, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px", boxShadow: `0 8px 24px ${glow}` }}>
        {name === "DocSense" ? "◎" : name === "MedPulse" ? "♡" : name === "Ledger" ? "◈" : name === "Timeline" ? "◔" : name === "Vault" ? "◑" : "◧"}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>{name}</div>
      <div style={{ fontSize: 13, color: T.textMuted, maxWidth: 320, margin: "0 auto" }}>Click through Dashboard, Thread, Atlas, Console, Friends, and Guest views for full mockups</div>
    </div>
  </div>
);

// ─── LOGIN ───
const Login = ({ onLogin }) => (
  <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <div style={{ position: "absolute", top: "20%", left: "30%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(108,99,255,0.15), transparent 70%)", filter: "blur(60px)" }} />
    <div style={{ position: "absolute", bottom: "20%", right: "25%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.1), transparent 70%)", filter: "blur(50px)" }} />
    <div style={{ position: "relative", width: 380, zIndex: 1 }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#6c63ff,#a78bfa)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: `0 8px 30px ${T.accentGlow}` }}>
          <span style={{ color: "#fff", fontSize: 24, fontWeight: 800 }}>N</span>
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, color: T.text, letterSpacing: -1.5 }}>Welcome to Nexus</div>
        <div style={{ fontSize: 14, color: T.textMuted, marginTop: 6 }}>Your family's private operating system</div>
      </div>
      <div style={{ ...glassCard, padding: "32px 28px" }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, color: T.textSec, fontWeight: 500, display: "block", marginBottom: 7 }}>Email</label>
          <input placeholder="you@nexus.dev" style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderGlass}`, borderRadius: 10, color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: T.textSec, fontWeight: 500, display: "block", marginBottom: 7 }}>Password</label>
          <input type="password" placeholder="••••••••" style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderGlass}`, borderRadius: 10, color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <button onClick={() => onLogin("dashboard")} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#6c63ff,#8b5cf6)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 20px ${T.accentGlow}` }}>Sign In</button>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 24 }}>
        <span style={{ fontSize: 13, color: T.accent, cursor: "pointer" }}>Request Access</span>
      </div>
    </div>
  </div>
);

// ─── MAIN ───
export default function Nexus() {
  const [screen, setScreen] = useState("login");
  const [isHome, setIsHome] = useState(true);
  const [view, setView] = useState("admin");

  if (screen === "login") return <Login onLogin={() => { setScreen("dashboard"); setView("admin"); }} />;

  const getTitle = () => {
    if (view === "guest") return "Project Showcase";
    if (view === "friends") return "College Friends";
    const titles = { dashboard: "Overview", docsense: "DocSense", medpulse: "MedPulse", ledger: "Ledger", timeline: "Timeline", thread: "Thread", vault: "Vault", gallery: "Gallery", atlas: "Atlas", console: "Console" };
    return titles[screen] || "Overview";
  };

  const content = () => {
    if (view === "guest") return <GuestScreen />;
    if (view === "friends") return <FriendsScreen />;
    const map = { dashboard: <DashboardScreen />, thread: <ThreadScreen />, atlas: <AtlasScreen />, console: <ConsoleScreen /> };
    if (map[screen]) return map[screen];
    const gradients = { docsense: ["linear-gradient(135deg,#3b82f6,#60a5fa)", "rgba(59,130,246,0.3)"], medpulse: ["linear-gradient(135deg,#10b981,#34d399)", T.greenGlow], ledger: ["linear-gradient(135deg,#f59e0b,#fbbf24)", T.amberGlow], timeline: ["linear-gradient(135deg,#8b5cf6,#a78bfa)", T.violetGlow], vault: ["linear-gradient(135deg,#475569,#94a3b8)", "rgba(71,85,105,0.3)"], gallery: ["linear-gradient(135deg,#e11d48,#fb7185)", T.roseGlow] };
    const [g, gw] = gradients[screen] || gradients.docsense;
    return <Placeholder name={getTitle()} gradient={g} glow={gw} />;
  };

  return (
    <div style={{ display: "flex", fontFamily: "'Inter', -apple-system, sans-serif", minHeight: "100vh", background: T.bg, color: T.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      <Sidebar active={screen} onNav={setScreen} isHome={isHome} view={view} onView={(v) => { setView(v); if (v === "admin") setScreen("dashboard"); if (v === "family") setScreen("dashboard"); if (v === "friends") setScreen("friends_feed"); if (v === "guest") setScreen("guest"); }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header title={getTitle()} isHome={isHome} onToggle={() => setIsHome(!isHome)} />
        <div style={{ flex: 1, overflowY: "auto" }}>{content()}</div>
      </div>
    </div>
  );
}
