"use client";

import { useState, useRef, useEffect } from "react";

const TEMPLATE_KEYS = [
  "how_to_playbook", "investigative_breakdown", "greentext_betrayal", "tier_ladder",
  "signs_list", "underdog_flex", "trader_existence", "fake_finance", "confrontation_anon",
  "startup_hype", "event_chain", "headline_reality", "red_flags", "quiet_moves",
];
const TEMPLATE_LABELS = {
  how_to_playbook: "How-To Playbook", investigative_breakdown: "Investigative",
  greentext_betrayal: "Greentext", tier_ladder: "Tier Ladder", signs_list: "Signs List",
  underdog_flex: "Underdog Flex", trader_existence: "Existence Check",
  fake_finance: "Fake Finance", confrontation_anon: "Confrontation",
  startup_hype: "Startup Hype", event_chain: "Event Chain",
  headline_reality: "Headline Reality", red_flags: "Red Flags", quiet_moves: "Quiet Moves",
};

const SYSTEM_PROMPT = `You are SHITPOST ENGINE v2 — a structured viral post generator.
Style: lowercase dominant, no emojis, no hashtags, structured formatting, short punch lines, screenshot clean spacing, no corporate tone, never over-explain.
Output ONLY final content. No explanation. No markdown labels. No commentary.
INTENSITY: 0–3 analytical · 4–7 sharp insider · 8–10 chaos energy
SINGLE POST: auto-select best structure. End with: reflective question OR dramatic teaser OR ironic CTA OR subtle prediction.
THREAD MODE: Generate EXACTLY the requested tweet count. Format: Tweet 1:\n...\nTweet 2:\n...
REPLY: max 2 lines. sharp. concise.
CONTEXT REPLY: understand original stance. max 2 lines.
METADATA: After content, on new line: METADATA::{"structure_used":"...","ending_type":"...","intensity_level":0,"total_score":0,"notes":"..."}
Score 0-100 dynamically. Never use 84 as default.`;

const engines = ["main", "template", "reply", "context_reply"];
const modes = ["single_post", "thread_mode", "auto_hook", "controversy_amplifier", "engagement_optimizer", "rewrite_in_style", "chaos_mode"];

// ── Global styles injected via style tag ─────────────────────────────────────
const GLOBAL_STYLES = `
  /* CRITICAL: Prevent auto-zoom on iOS/mobile when focusing inputs */
  @viewport { width: device-width; zoom: 1; }
  
  *, *::before, *::after { box-sizing: border-box; }
  
  html {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }
  
  body {
    margin: 0;
    padding: 0;
  }

  /* Prevent zoom on input focus — font-size must be >= 16px on mobile */
  input, textarea, select {
    font-size: 16px !important;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: #080808; }
  ::-webkit-scrollbar-thumb { background: #191919; border-radius: 2px; }
  
  textarea::placeholder { color: #2a2a2a !important; }
  textarea { caret-color: #ff5500; }
  button:hover { opacity: 0.85; }
  button:active { opacity: 0.7; transform: scale(0.97); }

  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  /* Mobile tap highlight removal */
  * { -webkit-tap-highlight-color: transparent; }

  @media (max-width: 640px) {
    .nav-subtitle { display: none; }
    .quick-chips { gap: 5px !important; }
  }
`;

// ── Ray Background ──────────────────────────────────────────────────────────
function RayBackground() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", userSelect: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: "#090909" }} />
      <div style={{
        position: "absolute", left: "50%", transform: "translateX(-50%)",
        width: 5000, height: 1800,
        background: "radial-gradient(circle at center 650px, rgba(255,75,0,0.5) 0%, rgba(255,75,0,0.15) 16%, rgba(255,75,0,0.05) 22%, transparent 30%)"
      }} />
      <div style={{ position: "absolute", top: 140, left: "50%", width: "min(1300px,100vw)", height: "min(1300px,100vw)", transform: "translate(-50%) rotate(180deg)" }}>
        {[
          { mt: -13, border: "13px solid rgba(255,255,255,0.85)", z: 5 },
          { mt: -10, border: "19px solid rgba(255,130,50,0.45)", z: 4 },
          { mt: -7, border: "19px solid rgba(255,90,20,0.35)", z: 3 },
          { mt: -3, border: "19px solid rgba(210,45,5,0.25)", z: 2 },
          { mt: 0, border: "17px solid #bb2e00", z: 1, shadow: "0 -10px 22px rgba(190,46,0,0.5)" },
        ].map((r, i) => (
          <div key={i} style={{
            position: "absolute", width: "100%", height: "100%", borderRadius: "50%",
            background: "#090909", marginTop: r.mt, border: r.border,
            transform: "rotate(180deg)", zIndex: r.z, boxShadow: r.shadow || "none",
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Dropdown util ───────────────────────────────────────────────────────────
function Dropdown({ trigger, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)}>{trigger(open)}</div>
      {open && <>
        <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          zIndex: 50, background: "rgba(11,11,11,0.98)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12,
          boxShadow: "0 20px 40px rgba(0,0,0,0.7)", overflow: "hidden",
          maxHeight: "60vh", overflowY: "auto",
        }}>
          {children(() => setOpen(false))}
        </div>
      </>}
    </div>
  );
}

// ── Pill button style ────────────────────────────────────────────────────────
const pill = (active, accent = "#ff5500") => ({
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "6px 13px", borderRadius: 99, fontSize: 11, cursor: "pointer",
  fontFamily: "'Courier New', monospace", letterSpacing: "0.04em",
  background: active ? `${accent}12` : "rgba(255,255,255,0.025)",
  border: `1px solid ${active ? `${accent}35` : "rgba(255,255,255,0.06)"}`,
  color: active ? accent : "#555",
  transition: "all 0.15s",
  minHeight: 32, // good touch target
});

const abtn = (bg, color) => ({
  background: bg, border: `1px solid ${color}`, color,
  fontFamily: "'Courier New', monospace", fontSize: 11,
  padding: "7px 14px", cursor: "pointer",
  letterSpacing: "0.1em", textTransform: "lowercase",
  borderRadius: 6, transition: "all 0.12s",
  minHeight: 32,
});

// ── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ score }) {
  const c = score >= 80 ? "#00ff88" : score >= 60 ? "#ffcc00" : "#ff4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 2, background: "#161616", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: c, transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 0 5px ${c}50` }} />
      </div>
      <span style={{ color: c, fontFamily: "monospace", fontSize: 11, minWidth: 24 }}>{score}</span>
    </div>
  );
}

// ── Engine selector badge ────────────────────────────────────────────────────
function EngineBadge({ engine, setEngine }) {
  const labels = { main: "⚡ main", template: "📋 template", reply: "↩ reply", context_reply: "🎯 ctx reply" };
  return (
    <Dropdown trigger={(open) => (
      <button style={{
        ...pill(true, "#ff5500"), padding: "7px 16px", fontWeight: 600, fontSize: 12,
        boxShadow: "inset 0 1px rgba(255,255,255,0.08)"
      }}>
        {labels[engine]}
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.4, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    )}>
      {close => (
        <div style={{ padding: 6, minWidth: 190 }}>
          <div style={{ padding: "5px 10px 3px", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "#333", fontFamily: "monospace" }}>engine</div>
          {engines.map(e => (
            <button key={e} onClick={() => { setEngine(e); close(); }} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 12px", background: engine === e ? "rgba(255,85,0,0.1)" : "transparent",
              border: "none", color: engine === e ? "#ff5500" : "#555",
              fontFamily: "'Courier New', monospace", fontSize: 12,
              cursor: "pointer", borderRadius: 7, transition: "all 0.1s", letterSpacing: "0.04em",
            }}>
              {labels[e]}
              {engine === e && <span style={{ fontSize: 10, color: "#ff5500" }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  );
}

// ── Mode selector ────────────────────────────────────────────────────────────
function ModeBadge({ mode, setMode }) {
  return (
    <Dropdown trigger={(open) => (
      <button style={pill(false)}>
        {mode}
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.35, transform: open ? "rotate(180deg)" : "none" }}>
          <path d="M1 3l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    )}>
      {close => (
        <div style={{ padding: 6, minWidth: 210 }}>
          {modes.map(m => (
            <button key={m} onClick={() => { setMode(m); close(); }} style={{
              width: "100%", padding: "10px 12px",
              background: mode === m ? "rgba(255,85,0,0.08)" : "transparent",
              border: "none", color: mode === m ? "#ff5500" : "#444",
              fontFamily: "'Courier New', monospace", fontSize: 12,
              cursor: "pointer", textAlign: "left", borderRadius: 6,
              transition: "all 0.1s", letterSpacing: "0.03em",
            }}>{m}</button>
          ))}
        </div>
      )}
    </Dropdown>
  );
}

// ── Template selector ────────────────────────────────────────────────────────
function TemplateBadge({ template, setTemplate }) {
  return (
    <Dropdown trigger={(open) => (
      <button style={pill(false)}>
        {TEMPLATE_LABELS[template]}
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.35, transform: open ? "rotate(180deg)" : "none" }}>
          <path d="M1 3l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    )}>
      {close => (
        <div style={{ padding: 6, minWidth: 240 }}>
          {TEMPLATE_KEYS.map(key => (
            <button key={key} onClick={() => { setTemplate(key); close(); }} style={{
              width: "100%", padding: "9px 12px",
              background: template === key ? "rgba(255,85,0,0.08)" : "transparent",
              border: "none", color: template === key ? "#ff5500" : "#444",
              fontFamily: "'Courier New', monospace", fontSize: 11,
              cursor: "pointer", textAlign: "left", borderRadius: 6,
              transition: "all 0.1s",
            }}>{TEMPLATE_LABELS[key]}</button>
          ))}
        </div>
      )}
    </Dropdown>
  );
}

// ── Intensity badge ──────────────────────────────────────────────────────────
function IntensityBadge({ intensity, setIntensity }) {
  const c = intensity <= 3 ? "#4488ff" : intensity <= 7 ? "#ffaa00" : "#ff3300";
  const label = intensity <= 3 ? "analytical" : intensity <= 7 ? "sharp" : "chaos";
  return (
    <Dropdown trigger={() => (
      <button style={{ ...pill(false), color: c, borderColor: `${c}30`, background: `${c}08` }}>
        {intensity} · {label}
      </button>
    )}>
      {() => (
        <div style={{ padding: "14px 16px", minWidth: 210 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "#2a2a2a", fontFamily: "monospace", marginBottom: 10 }}>intensity — {intensity}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 9, color: "#333", fontFamily: "monospace" }}>0</span>
            <input type="range" min={0} max={10} value={intensity}
              onChange={e => setIntensity(+e.target.value)}
              style={{ flex: 1, accentColor: c, cursor: "pointer", height: 24 }} />
            <span style={{ fontSize: 9, color: "#333", fontFamily: "monospace" }}>10</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 9, color: "#4488ff", fontFamily: "monospace" }}>analytical</span>
            <span style={{ fontSize: 9, color: "#ff3300", fontFamily: "monospace" }}>chaos</span>
          </div>
        </div>
      )}
    </Dropdown>
  );
}

// ── Main input ───────────────────────────────────────────────────────────────
function ChatInput({ onGenerate, loading, engine, setEngine, mode, setMode, template, setTemplate, intensity, setIntensity, tweetCount, setTweetCount }) {
  const [msg, setMsg] = useState("");
  const [second, setSecond] = useState("");
  const taRef = useRef(null);

  useEffect(() => {
    const ta = taRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = `${Math.min(ta.scrollHeight, 180)}px`; }
  }, [msg]);

  const ph = engine === "reply" ? "paste tweet to reply to..." : engine === "context_reply" ? "paste the original post..." : "paste anything — article, tweet, hot take, data...";

  const submit = () => {
    if (!msg.trim() || loading) return;
    onGenerate(msg, second);
  };

  return (
    <div style={{ width: "100%", maxWidth: 660, margin: "0 auto", position: "relative", padding: "0 16px" }}>
      <div style={{ position: "absolute", inset: -1, borderRadius: 20, background: "linear-gradient(180deg,rgba(255,255,255,0.06) 0%,transparent 100%)", pointerEvents: "none" }} />
      <div style={{
        position: "relative", borderRadius: 20,
        background: "rgba(13,13,13,0.92)", backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 6px 40px rgba(0,0,0,0.6)",
      }}>
        {/* Main textarea — font-size 16px prevents iOS auto-zoom */}
        <textarea
          ref={taRef} value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder={ph}
          style={{
            width: "100%", minHeight: 80, maxHeight: 180,
            background: "transparent", border: "none", outline: "none",
            resize: "none", color: "#d8d8d8",
            fontFamily: "'Courier New', monospace",
            fontSize: "16px", // MUST be 16px+ to prevent iOS zoom
            padding: "20px 20px 10px", lineHeight: 1.75,
            boxSizing: "border-box",
            WebkitAppearance: "none",
          }}
        />

        {engine === "context_reply" && (
          <>
            <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "0 16px" }} />
            <textarea value={second} onChange={e => setSecond(e.target.value)}
              placeholder="your comment / what you want to say..."
              style={{
                width: "100%", minHeight: 52,
                background: "transparent", border: "none", outline: "none",
                resize: "none", color: "#666",
                fontFamily: "'Courier New', monospace",
                fontSize: "16px", // MUST be 16px+ to prevent iOS zoom
                padding: "12px 20px", lineHeight: 1.6, boxSizing: "border-box",
                WebkitAppearance: "none",
              }} />
          </>
        )}

        {/* Toolbar — wraps on mobile */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 12px 14px", gap: 8, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <EngineBadge engine={engine} setEngine={setEngine} />
            {engine === "main" && <ModeBadge mode={mode} setMode={setMode} />}
            {engine === "template" && <TemplateBadge template={template} setTemplate={setTemplate} />}
            {(engine === "main" || engine === "template") && <IntensityBadge intensity={intensity} setIntensity={setIntensity} />}
            {engine === "main" && mode === "thread_mode" && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 9, color: "#333", fontFamily: "monospace" }}>tweets</span>
                <input type="range" min={2} max={12} value={tweetCount} onChange={e => setTweetCount(+e.target.value)}
                  style={{ width: 64, accentColor: "#888", height: 24 }} />
                <span style={{ fontSize: 10, color: "#555", fontFamily: "monospace" }}>{tweetCount}</span>
              </div>
            )}
          </div>

          <button onClick={submit} disabled={!msg.trim() || loading} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 22px", borderRadius: 99, fontSize: 12,
            fontFamily: "'Courier New', monospace", fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            background: msg.trim() && !loading ? "#ff5500" : "#0d0d0d",
            color: msg.trim() && !loading ? "#fff" : "#2a2a2a",
            border: "none", cursor: msg.trim() && !loading ? "pointer" : "not-allowed",
            transition: "all 0.18s",
            boxShadow: msg.trim() && !loading ? "0 0 24px rgba(255,85,0,0.4)" : "none",
            minHeight: 42, // good touch target
            flexShrink: 0,
          }}>
            {loading ? "generating..." : <>generate <span style={{ fontSize: 15 }}>→</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Output panel ─────────────────────────────────────────────────────────────
function OutputPanel({ output, metadata, loading, onRegenerate, onClear }) {
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(null);
  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (!output && !loading) return null;

  return (
    <div style={{ width: "100%", maxWidth: 660, margin: "16px auto 0", display: "flex", flexDirection: "column", gap: 12, padding: "0 16px" }}>
      <div style={{
        background: "rgba(9,9,9,0.92)", backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.055)", borderRadius: 14,
        padding: "24px 20px", boxShadow: "0 4px 30px rgba(0,0,0,0.45)",
      }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "16px 0" }}>
            <div style={{ width: 2, height: 26, background: "#ff5500", animation: "blink 0.8s infinite", borderRadius: 1 }} />
            <span style={{ fontSize: 9, letterSpacing: "0.22em", color: "#2a2a2a", textTransform: "uppercase", fontFamily: "monospace" }}>generating</span>
          </div>
        ) : (
          <pre style={{ fontFamily: "'Courier New', monospace", fontSize: 13, lineHeight: 1.9, color: "#d4d4d4", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, overflowX: "hidden" }}>
            {output}
          </pre>
        )}
      </div>

      {metadata && !loading && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
          background: "rgba(7,7,7,0.9)", backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10, overflow: "hidden",
        }}>
          {[["structure", metadata.structure_used || "—"], ["ending", metadata.ending_type || "—"], ["intensity", `${metadata.intensity_level ?? 0} / 10`]].map(([k, v]) => (
            <div key={k} style={{ padding: "10px 12px", borderRight: "1px solid rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "#242424", fontFamily: "monospace", marginBottom: 4 }}>{k}</div>
              <div style={{ fontSize: 11, color: "#4a4a4a", fontFamily: "monospace", wordBreak: "break-all" }}>{v}</div>
            </div>
          ))}
          <div style={{ padding: "10px 12px" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "#242424", fontFamily: "monospace", marginBottom: 7 }}>score</div>
            <ScoreBar score={metadata.total_score || 0} />
            {metadata.notes && <div style={{ fontSize: 9, color: "#222", fontFamily: "monospace", marginTop: 3 }}>{metadata.notes}</div>}
          </div>
        </div>
      )}

      {!loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <button onClick={copy} style={abtn(copied ? "rgba(0,255,136,0.08)" : "rgba(255,255,255,0.02)", copied ? "#00ff88" : "#383838")}>
            {copied ? "copied ✓" : "copy"}
          </button>
          <button onClick={() => window.open(`https://x.com/intent/post?text=${encodeURIComponent(output)}`, "_blank")} style={abtn("rgba(255,255,255,0.02)", "#383838")}>post to x →</button>
          <button onClick={onRegenerate} style={abtn("rgba(255,255,255,0.02)", "#383838")}>regenerate</button>
          <button onClick={onClear} style={abtn("rgba(255,255,255,0.02)", "#383838")}>clear</button>
          <div style={{ marginLeft: "auto", display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 8, color: "#222", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "monospace" }}>rate:</span>
            {[["🔥", "fire"], ["👍", "good"], ["👎", "bad"]].map(([e, v]) => (
              <button key={v} onClick={() => setRating(v)}
                style={{ ...abtn(rating === v ? "#111" : "transparent", rating === v ? "#484848" : "#1e1e1e"), fontSize: 15, padding: "5px 10px" }}>{e}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function ShitpostEngine() {
  const [engine, setEngine] = useState("main");
  const [mode, setMode] = useState("single_post");
  const [template, setTemplate] = useState(TEMPLATE_KEYS[0]);
  const [intensity, setIntensity] = useState(6);
  const [tweetCount, setTweetCount] = useState(3);
  const [output, setOutput] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const lastRef = useRef({ msg: "", second: "" });

  const buildPrompt = (msg, second) => {
    if (engine === "reply") return `Engine: reply\nContent:\n${msg}\n\nGenerate a reply. Max 2 lines.`;
    if (engine === "context_reply") return `Engine: context_reply\nOriginal post:\n${msg}\n\nComment:\n${second}\n\nMax 2 lines.`;
    if (engine === "template") return `Engine: template\nTemplate: ${template}\nIntensity: ${intensity}\nTopic:\n${msg}\n\nGenerate using ${template} EXACTLY.`;
    if (mode === "thread_mode") return `Engine: main\nMode: thread_mode\nTweet count: ${tweetCount} (EXACT)\nIntensity: ${intensity}\nContent:\n${msg}`;
    if (mode === "auto_hook") return `Engine: main\nMode: auto_hook\nIntensity: ${intensity}\nContent:\n${msg}\n\nGenerate 5 hooks under 15 words each. Numbered 1-5.`;
    return `Engine: main\nMode: ${mode}\nIntensity: ${intensity}\nContent:\n${msg}`;
  };

  const generate = async (msg, second = "") => {
    lastRef.current = { msg, second };
    setLoading(true); setOutput(""); setMetadata(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: SYSTEM_PROMPT, messages: [{ role: "user", content: buildPrompt(msg, second) }] }),
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "";
      const m = raw.match(/METADATA::(\{.*\})/);
      let meta = null, clean = raw;
      if (m) { try { meta = JSON.parse(m[1]); } catch { } clean = raw.replace(/\nMETADATA::.*/, "").trim(); }
      setOutput(clean); setMetadata(meta);
      setHistory(prev => [{ id: Date.now(), engine, mode: engine === "main" ? mode : engine, template: engine === "template" ? template : null, content: clean, metadata: meta, intensity, timestamp: new Date().toISOString() }, ...prev].slice(0, 50));
    } catch { setOutput("generation failed."); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#090909", color: "#d0d0d0", fontFamily: "'Courier New', monospace", display: "flex", flexDirection: "column", position: "relative", overflowX: "clip" }}>
      <style>{GLOBAL_STYLES}</style>

      <RayBackground />

      {/* NAV */}
      <div style={{
        position: "relative", zIndex: 10,
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        padding: "12px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", color: "#e0e0e0", textTransform: "uppercase" }}>SHITPOST ENGINE</span>
          <span style={{ fontSize: 10, color: "#222", letterSpacing: "0.06em" }}>v2</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="nav-subtitle" style={{ fontSize: 10, color: "#1c1c1c", letterSpacing: "0.04em" }}>paste anything → viral post → copy → profit</span>
          <button onClick={() => setShowHistory(true)} style={abtn("rgba(255,255,255,0.02)", "#222")}>
            history [{history.length}]
          </button>
        </div>
      </div>

      {/* HERO */}
      <div style={{
        position: "relative", zIndex: 10, flex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "40px 0 80px",
      }}>
        {/* Announcement badge */}
        <div style={{ marginBottom: 24, padding: "0 16px" }}>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 18px", minHeight: 36, borderRadius: 99,
            fontSize: 12, cursor: "pointer", letterSpacing: "0.1em",
            fontFamily: "'Courier New', monospace", fontWeight: 700,
            color: "#1488fc", border: "1px solid rgba(20,136,252,0.18)",
            background: "rgba(20,136,252,0.05)",
            boxShadow: "0 0 20px rgba(20,136,252,0.15)",
            textAlign: "center",
          }}>
            SHITPOST ENGINE
          </button>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 28, padding: "0 20px" }}>
          <h1 style={{
            fontSize: "clamp(26px,6vw,50px)", fontWeight: 800,
            color: "#e4e4e4", letterSpacing: "-0.02em", lineHeight: 1.2,
            margin: "0 0 10px", fontFamily: "'Courier New', monospace",
          }}>
            what will you{" "}
            <span style={{
              background: "linear-gradient(180deg,#ff8040 0%,#ff5500 45%,#fff 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              fontStyle: "italic",
            }}>shitpost</span>{" "}today?
          </h1>
          <p style={{ fontSize: 13, color: "#2e2e2e", margin: 0, letterSpacing: "0.04em", fontFamily: "monospace" }}>
            paste anything → structured viral post → copy → profit
          </p>
        </div>

        {/* Chat input */}
        <div style={{ width: "100%", maxWidth: 692 }}>
          <ChatInput
            onGenerate={generate} loading={loading}
            engine={engine} setEngine={setEngine}
            mode={mode} setMode={setMode}
            template={template} setTemplate={setTemplate}
            intensity={intensity} setIntensity={setIntensity}
            tweetCount={tweetCount} setTweetCount={setTweetCount}
          />
        </div>

        {/* Quick chips */}
        {!output && !loading && (
          <div className="quick-chips" style={{ display: "flex", gap: 7, marginTop: 18, flexWrap: "wrap", justifyContent: "center", padding: "0 20px" }}>
            {["single_post", "thread_mode", "auto_hook", "chaos_mode"].map(m => (
              <button key={m} onClick={() => { setEngine("main"); setMode(m); }} style={{
                padding: "5px 13px", borderRadius: 99, fontSize: 10,
                fontFamily: "monospace", letterSpacing: "0.06em",
                background: "transparent", cursor: "pointer", transition: "all 0.12s",
                border: mode === m && engine === "main" ? "1px solid rgba(255,85,0,0.3)" : "1px solid #131313",
                color: mode === m && engine === "main" ? "#ff5500" : "#272727",
                minHeight: 30,
              }}>{m}</button>
            ))}
          </div>
        )}

        {/* Output */}
        <div style={{ width: "100%", maxWidth: 692 }}>
          <OutputPanel
            output={output} metadata={metadata} loading={loading}
            onRegenerate={() => { const { msg, second } = lastRef.current; if (msg) generate(msg, second); }}
            onClear={() => { setOutput(""); setMetadata(null); }}
          />
        </div>
      </div>

      {/* History drawer */}
      {showHistory && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 200, display: "flex", justifyContent: "flex-end" }} onClick={() => setShowHistory(false)}>
          <div style={{
            width: "min(370px, 100vw)",
            background: "#060606", borderLeft: "1px solid #111",
            padding: 20, overflowY: "auto",
            display: "flex", flexDirection: "column", gap: 9,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <span style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2a2a2a", fontFamily: "monospace" }}>history</span>
              <button onClick={() => setShowHistory(false)} style={abtn("#0a0a0a", "#1e1e1e")}>close</button>
            </div>
            {history.length === 0 && <span style={{ color: "#181818", fontSize: 11, fontFamily: "monospace" }}>no posts yet.</span>}
            {history.map(e => (
              <div key={e.id} onClick={() => { setOutput(e.content); setMetadata(e.metadata); setShowHistory(false); }}
                style={{ border: "1px solid #111", padding: 12, cursor: "pointer", background: "#040404", borderRadius: 7, transition: "border-color 0.12s" }}
                onMouseEnter={ev => ev.currentTarget.style.borderColor = "#222"}
                onMouseLeave={ev => ev.currentTarget.style.borderColor = "#111"}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 9, color: "#303030", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "monospace" }}>{e.mode}{e.template ? ` · ${e.template}` : ""}</span>
                  {e.metadata?.total_score > 0 && <span style={{ fontSize: 9, color: "#00ff88", fontFamily: "monospace" }}>{e.metadata.total_score}</span>}
                </div>
                <div style={{ fontSize: 11, color: "#383838", lineHeight: 1.5, overflow: "hidden", maxHeight: 46, fontFamily: "monospace" }}>{e.content.slice(0, 95)}...</div>
                <div style={{ fontSize: 9, color: "#181818", marginTop: 3, fontFamily: "monospace" }}>{new Date(e.timestamp).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}