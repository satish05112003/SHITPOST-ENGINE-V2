import { useState, useRef, useEffect } from "react";

// Internal template keys (not shown in UI)
const TEMPLATE_KEYS = [
  "how_to_playbook",
  "investigative_breakdown",
  "greentext_betrayal",
  "tier_ladder",
  "signs_list",
  "underdog_flex",
  "trader_existence",
  "fake_finance",
  "confrontation_anon",
  "startup_hype",
  "event_chain",
  "headline_reality",
  "red_flags",
  "quiet_moves",
];

// Full structure previews shown in UI
const TEMPLATE_PREVIEWS = {
  how_to_playbook: `how to [main outcome]

1) [step]
2) [step]
3) [step]
4) [step]

[ironic conclusion]

what do we learn?`,

  investigative_breakdown: `[topic] case:

early phase:

1)
2)
3)

major shift:

1)
2)
3)

allegations:

1)
2)
3)

connect the dots.`,

  greentext_betrayal: `[entity]

> [statement]
> [statement]
> [statement]
> [statement]
> [statement]

[one-word close].`,

  tier_ladder: `$10 version:
- [point]
- [point]
- [point]

$100 version:
- [point]
- [point]

$1000 version:
- [point]

$10000 version:

???`,

  signs_list: `signs of a [type]

1) [trait]
2) [trait]
3) [trait]
4) [trait]
5) [trait]

they won't tell you this.`,

  underdog_flex: `- they said [doubt]
- they said [limitation]

analytics says:

> [metric]
> [metric]
> [metric]

attention > followers

what's your excuse?`,

  trader_existence: `life of average [role]

- [action]
- [action]
- [action]
- [action]
- [action]

was it ever about [core theme]?`,

  fake_finance: `how to make money in crypto

- [step]
- [step]
- [step]
- [step]

crypto is easy

follow for more advice.`,

  confrontation_anon: `you think you're anonymous?

> [trace point]
> [trace point]
> [trace point]
> [trace point]

real ones don't move like this.

be honest with yourself.`,

  startup_hype: `how to become a unicorn in [timeframe]

1) [step]
2) [step]
3) [step]
4) [step]

next phase loading.`,

  event_chain: `this is how it starts:

1) [event]
2) [event]
3) [event]

and people say it's random.`,

  headline_reality: `headline:
"[claim]"

reality:

- [fact]
- [fact]
- [fact]

markets reward awareness.`,

  red_flags: `red flags:

1) [issue]
2) [issue]
3) [issue]
4) [issue]

but people still aped.`,

  quiet_moves: `while you were distracted:

- [quiet move]
- [quiet move]
- [quiet move]

and you still call it dead.`,
};

const SYSTEM_PROMPT = `You are SHITPOST ENGINE v2 — a structured viral post generator.

GLOBAL STYLE DNA:
Tone priority: insider > numeric > sharp > dramatic > slightly cynical
Rules:
- lowercase dominant
- no emojis
- no hashtags
- structured formatting
- short punch lines
- screenshot clean spacing
- no corporate tone
- no long paragraphs
- imply commentary
- never over-explain

Output ONLY final content. No explanation. No markdown labels. No commentary.

INTENSITY SCALE:
0–3 → analytical
4–7 → sharp insider
8–10 → chaos energy

SINGLE POST auto-select structure from:
how-to playbook / investigative breakdown / numbered list / greentext / tier ladder / confrontation / underdog flex / existential reflection

Must end with: reflective question OR dramatic teaser OR ironic CTA OR subtle prediction

THREAD MODE: Generate EXACTLY the requested tweet count. Format:
Tweet 1:
...
Tweet 2:
...
(stop at exact count)

TEMPLATES — follow EXACTLY if template mode:

how_to_playbook:
how to [main absurd outcome]
1) [step]
2) [step]
3) [step]
4) [step]
[ironic conclusion]
what do we learn?

investigative_breakdown:
[topic] case:
early phase:
1) 2) 3)
major shift:
1) 2) 3)
allegations:
1) 2) 3)
connect the dots.

greentext_betrayal:
[entity]
> [statement]
> [statement]
> [statement]
> [statement]
> [statement]
[one-word ironic close].

tier_ladder:
$10 version: [points]
$100 version: [points]
$1000 version: [point]
$10000 version: ???

signs_list:
signs of a [type]
1)–5) [traits]
they won't tell you this.

underdog_flex:
- they said [doubt]
- they said [limitation]
analytics says:
> [metric] > [metric] > [metric]
attention > followers
what's your excuse?

trader_existence:
life of average [role]
- [actions x5]
was it ever about [core theme]?

fake_finance:
how to make money in crypto
- [steps x4]
crypto is easy
follow for more advice.

confrontation_anon:
you think you're anonymous?
> [trace points x4]
real ones don't move like this.
be honest with yourself.

startup_hype:
how to become a unicorn in [timeframe]
1)–4) [steps]
next phase loading.

event_chain:
this is how it starts:
1) [event] 2) [event] 3) [event]
and people say it's random.

headline_reality:
headline: "[claim]"
reality: - [fact] - [fact] - [fact]
markets reward awareness.

red_flags:
red flags:
1)–4) [issues]
but people still aped.

quiet_moves:
while you were distracted:
- [quiet move x3]
and you still call it dead.

REPLY ENGINE: max 2 lines. sharp. concise. context-aware. no thread.

CONTEXT REPLY: understand original stance. stay consistent. max 2 lines. no thread.

STYLE METADATA: After content, on new line return exactly:
METADATA::{"structure_used":"...","ending_type":"...","intensity_level":0,"total_score":0,"notes":"..."}
Score dynamically 0-100 based on: structure clarity, numeric authority, punch intensity, insider tone, ending strength, virality potential. Never use 84 as default.`;

const engines = ["main", "template", "reply", "context_reply"];
const modes = ["single_post", "thread_mode", "auto_hook", "controversy_amplifier", "engagement_optimizer", "rewrite_in_style", "chaos_mode"];

function ScoreBar({ score }) {
  const color = score >= 80 ? "#00ff88" : score >= 60 ? "#ffcc00" : "#ff4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        flex: 1, height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden"
      }}>
        <div style={{
          width: `${score}%`, height: "100%", background: color,
          transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: `0 0 8px ${color}80`
        }} />
      </div>
      <span style={{ color, fontFamily: "monospace", fontSize: 13, minWidth: 30 }}>{score}</span>
    </div>
  );
}

function OutputBlock({ text }) {
  return (
    <pre style={{
      fontFamily: "'Courier New', monospace",
      fontSize: 14,
      lineHeight: 1.8,
      color: "#e8e8e8",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      margin: 0,
      padding: 0,
    }}>{text}</pre>
  );
}

const STORAGE_KEY = "spe_history_v1";

export default function ShitpostEngine() {
  const [engine, setEngine] = useState("main");
  const [mode, setMode] = useState("single_post");
  const [template, setTemplate] = useState(TEMPLATE_KEYS[0]);
  const [content, setContent] = useState("");
  const [originalPost, setOriginalPost] = useState("");
  const [comment, setComment] = useState("");
  const [intensity, setIntensity] = useState(6);
  const [tweetCount, setTweetCount] = useState(3);
  const [output, setOutput] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  
  const [showHistory, setShowHistory] = useState(false);
  const [rating, setRating] = useState(null);
  const textareaRef = useRef(null);
  useEffect(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setHistory(JSON.parse(raw));
  } catch {}
}, []);

  const saveToHistory = (entry) => {
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, 50);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const buildUserPrompt = () => {
    if (engine === "reply") {
      return `Engine: reply\nContent to reply to:\n${content}\n\nGenerate a reply. Max 2 lines.`;
    }
    if (engine === "context_reply") {
      return `Engine: context_reply\nOriginal post:\n${originalPost}\n\nComment:\n${comment}\n\nGenerate a context-aware reply. Max 2 lines.`;
    }
    if (engine === "template") {
      return `Engine: template\nTemplate: ${template}\nIntensity: ${intensity}\nContent/topic:\n${content}\n\nGenerate using the ${template} template EXACTLY.`;
    }
    if (mode === "thread_mode") {
      return `Engine: main\nMode: thread_mode\nTweet count: ${tweetCount} (EXACT)\nIntensity: ${intensity}\nContent:\n${content}\n\nGenerate EXACTLY ${tweetCount} tweets.`;
    }
    if (mode === "auto_hook") {
      return `Engine: main\nMode: auto_hook\nIntensity: ${intensity}\nContent:\n${content}\n\nGenerate 5 hooks under 15 words each. Numbered 1-5.`;
    }
    return `Engine: main\nMode: ${mode}\nIntensity: ${intensity}\nContent:\n${content}`;
  };

  const generate = async () => {
    const hasContent = engine === "context_reply"
      ? originalPost.trim() && comment.trim()
      : content.trim();
    if (!hasContent) return;

    setLoading(true);
    setError("");
    setOutput("");
    setMetadata(null);
    setRating(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: buildUserPrompt() }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.map(b => b.text || "").join("") || "";
      console.log("RAW OUTPUT:", raw);

      // Parse metadata
      const metaMatch = raw.match(/METADATA::(\{.*\})/);
      let meta = null;
      let cleanOutput = raw;
      if (metaMatch) {
        try { meta = JSON.parse(metaMatch[1]); } catch {}
        cleanOutput = raw.replace(/\nMETADATA::.*/, "").trim();
      }

      setOutput(cleanOutput);
      setMetadata(meta);

      const entry = {
        id: Date.now(),
        engine, mode: engine === "main" ? mode : engine,
        template: engine === "template" ? template : null,
        content: cleanOutput,
        metadata: meta,
        intensity,
        timestamp: new Date().toISOString(),
      };
      saveToHistory(entry);
    } catch (e) {
      setError("generation failed. check console.");
      console.error(e);
    }
    setLoading(false);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePostToX = () => {
    const encodedText = encodeURIComponent(output);
    const url = `https://x.com/intent/post?text=${encodedText}`;
    window.open(url, "_blank");
  };

  const loadFromHistory = (entry) => {
    setOutput(entry.content);
    setMetadata(entry.metadata);
    setShowHistory(false);
  };

  const isReady = engine === "context_reply"
    ? originalPost.trim() && comment.trim()
    : content.trim();

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#0a0a0a",
      color: "#e0e0e0",
      fontFamily: "'Courier New', monospace",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* NAVBAR */}
      <div style={{
        borderBottom: "1px solid #1f1f1f",
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#080808",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#fff",
            textTransform: "uppercase",
          }}>SHITPOST ENGINE</span>
          <span style={{ fontSize: 11, color: "#444", letterSpacing: "0.05em" }}>v2</span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#333", letterSpacing: "0.05em" }}>
            paste anything → structured viral post → copy → profit
          </span>
          <button onClick={() => setShowHistory(!showHistory)} style={btnStyle("#1a1a1a", "#333")}>
            history [{history.length}]
          </button>
        </div>
      </div>

      {/* HISTORY OVERLAY */}
      {showHistory && (
        <div style={{
          position: "fixed", inset: 0, background: "#000000ee",
          zIndex: 200, display: "flex", justifyContent: "flex-end",
        }} onClick={() => setShowHistory(false)}>
          <div style={{
            width: 400, background: "#0d0d0d", borderLeft: "1px solid #1f1f1f",
            padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, letterSpacing: "0.15em", color: "#666", textTransform: "uppercase" }}>history</span>
              <button onClick={() => setShowHistory(false)} style={btnStyle("#111", "#333")}>close</button>
            </div>
            {history.length === 0 && <span style={{ color: "#333", fontSize: 12 }}>no posts yet.</span>}
            {history.map(entry => (
              <div key={entry.id} style={{
                border: "1px solid #1a1a1a", padding: 12, cursor: "pointer",
                background: "#0a0a0a", transition: "border-color 0.15s",
              }}
                onClick={() => loadFromHistory(entry)}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#333"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {entry.mode} {entry.template ? `· ${entry.template}` : ""}
                  </span>
                  {entry.metadata?.total_score > 0 && (
                    <span style={{ fontSize: 10, color: "#00ff88" }}>{entry.metadata.total_score}</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5, overflow: "hidden", maxHeight: 60, textOverflow: "ellipsis" }}>
                  {entry.content.slice(0, 120)}...
                </div>
                <div style={{ fontSize: 10, color: "#333", marginTop: 4 }}>
                  {new Date(entry.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "360px 1fr",
        gap: 0,
      }}>
        {/* LEFT PANEL */}
        <div style={{
          borderRight: "1px solid #1a1a1a",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          overflowY: "auto",
        }}>
          {/* Engine Selector */}
          <Section label="engine">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {engines.map(e => (
                <button key={e} onClick={() => setEngine(e)}
                  style={chipStyle(engine === e)}>
                  {e}
                </button>
              ))}
            </div>
          </Section>

          {/* Mode (main only) */}
          {engine === "main" && (
            <Section label="mode">
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {modes.map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    style={{ ...chipStyle(mode === m), textAlign: "left" }}>
                    {m}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* Template selector + preview */}
          {engine === "template" && (
            <Section label="template">
              <div style={{ display: "flex", gap: 10 }}>
                {/* List: numbered, no internal names */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 44 }}>
                  {TEMPLATE_KEYS.map((key, i) => (
                    <button key={key} onClick={() => setTemplate(key)}
                      style={{
                        ...chipStyle(template === key),
                        padding: "5px 8px",
                        fontSize: 10,
                        textAlign: "center",
                        letterSpacing: "0.08em",
                      }}>
                      #{String(i + 1).padStart(2, "0")}
                    </button>
                  ))}
                </div>
                {/* Preview */}
                <div style={{
                  flex: 1,
                  background: "#070707",
                  border: "1px solid #181818",
                  padding: "12px 14px",
                  overflow: "auto",
                  maxHeight: 320,
                }}>
                  <pre style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 11,
                    lineHeight: 1.75,
                    color: "#555",
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}>
                    {TEMPLATE_PREVIEWS[template]}
                  </pre>
                </div>
              </div>
            </Section>
          )}

          {/* Inputs */}
          {engine === "context_reply" ? (
            <>
              <Section label="original post">
                <textarea
                  value={originalPost}
                  onChange={e => setOriginalPost(e.target.value)}
                  placeholder="paste the original post..."
                  style={textareaStyle}
                  rows={4}
                />
              </Section>
              <Section label="your comment / context">
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="what you want to say..."
                  style={textareaStyle}
                  rows={3}
                />
              </Section>
            </>
          ) : (
            <Section label="input">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={
                  engine === "reply" ? "paste tweet to reply to..."
                  : "paste anything — article, tweet, hot take, data..."
                }
                style={{ ...textareaStyle, minHeight: 140 }}
              />
            </Section>
          )}

          {/* Intensity */}
          {(engine === "main" || engine === "template") && (
            <Section label={`intensity — ${intensity}`}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 10, color: "#444" }}>analytical</span>
                <input
                  type="range" min={0} max={10} value={intensity}
                  onChange={e => setIntensity(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#fff", cursor: "pointer" }}
                />
                <span style={{ fontSize: 10, color: "#444" }}>chaos</span>
              </div>
            </Section>
          )}

          {/* Tweet count */}
          {engine === "main" && mode === "thread_mode" && (
            <Section label={`tweets — ${tweetCount}`}>
              <input
                type="range" min={2} max={12} value={tweetCount}
                onChange={e => setTweetCount(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#fff", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 10, color: "#444" }}>2</span>
                <span style={{ fontSize: 10, color: "#444" }}>12</span>
              </div>
            </Section>
          )}

          {/* Generate */}
          <button
            onClick={generate}
            disabled={!isReady || loading}
            style={{
              background: isReady && !loading ? "#fff" : "#111",
              color: isReady && !loading ? "#000" : "#333",
              border: "none",
              padding: "14px 0",
              fontSize: 12,
              fontFamily: "inherit",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              cursor: isReady && !loading ? "pointer" : "not-allowed",
              transition: "all 0.15s",
              fontWeight: 700,
            }}
          >
            {loading ? "generating..." : "generate →"}
          </button>

          {error && <span style={{ fontSize: 11, color: "#ff4444" }}>{error}</span>}
        </div>

        {/* RIGHT PANEL */}
        <div style={{
          padding: 32,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          overflowY: "auto",
        }}>
          {!output && !loading && (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center", gap: 8, opacity: 0.15,
            }}>
              <div style={{ fontSize: 48, letterSpacing: "0.05em" }}>∅</div>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>awaiting input</div>
            </div>
          )}

          {loading && (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 2, height: 40, background: "#fff",
                animation: "blink 0.8s infinite",
              }} />
              <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#444", textTransform: "uppercase" }}>generating</div>
            </div>
          )}

          {output && (
            <>
              {/* Output box */}
              <div style={{
                background: "#0d0d0d",
                border: "1px solid #1f1f1f",
                padding: "28px 32px",
                position: "relative",
              }}>
                <OutputBlock text={output} />
              </div>

              {/* Metadata bar */}
              {metadata && (
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: 16, padding: "16px 20px",
                  border: "1px solid #141414",
                  background: "#080808",
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <Label>structure</Label>
                    <span style={{ fontSize: 12, color: "#888" }}>{metadata.structure_used || "—"}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <Label>ending</Label>
                    <span style={{ fontSize: 12, color: "#888" }}>{metadata.ending_type || "—"}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <Label>score</Label>
                    <ScoreBar score={metadata.total_score || 0} />
                    {metadata.notes && <span style={{ fontSize: 10, color: "#444" }}>{metadata.notes}</span>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <Label>intensity</Label>
                    <span style={{ fontSize: 12, color: "#888" }}>{metadata.intensity_level ?? intensity} / 10</span>
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={copyOutput} style={btnStyle(copied ? "#00ff8830" : "#111", copied ? "#00ff88" : "#555")}>
                  {copied ? "copied ✓" : "copy"}
                </button>
                <button onClick={handlePostToX} style={btnStyle("#111", "#555")}>
                  post →
                </button>
                <button onClick={generate} style={btnStyle("#111", "#555")}>regenerate</button>
                <button onClick={() => { setOutput(""); setMetadata(null); setRating(null); }} style={btnStyle("#111", "#555")}>clear</button>
              </div>

              {/* Rating */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 10, color: "#333", letterSpacing: "0.1em", textTransform: "uppercase" }}>rate:</span>
                {[["🔥", "fire"], ["👍", "good"], ["👎", "bad"]].map(([emoji, val]) => (
                  <button key={val} onClick={() => setRating(val)}
                    style={{
                      ...btnStyle(rating === val ? "#1a1a1a" : "#0d0d0d", rating === val ? "#666" : "#2a2a2a"),
                      fontSize: 16, padding: "6px 12px",
                    }}>
                    {emoji}
                  </button>
                ))}
                {rating && <span style={{ fontSize: 10, color: "#444" }}>saved</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Utility styled components ----

function Section({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Label({ children }) {
  return (
    <span style={{
      fontSize: 9,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "#3a3a3a",
    }}>{children}</span>
  );
}

const textareaStyle = {
  background: "#0d0d0d",
  border: "1px solid #1a1a1a",
  color: "#ccc",
  fontFamily: "'Courier New', monospace",
  fontSize: 12,
  padding: "12px 14px",
  resize: "vertical",
  outline: "none",
  lineHeight: 1.7,
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

function chipStyle(active) {
  return {
    background: active ? "#1a1a1a" : "transparent",
    border: `1px solid ${active ? "#333" : "#151515"}`,
    color: active ? "#e0e0e0" : "#444",
    fontFamily: "'Courier New', monospace",
    fontSize: 11,
    padding: "7px 12px",
    cursor: "pointer",
    letterSpacing: "0.05em",
    transition: "all 0.1s",
  };
}

function btnStyle(bg, color) {
  return {
    background: bg,
    border: `1px solid ${color}`,
    color: color,
    fontFamily: "'Courier New', monospace",
    fontSize: 10,
    padding: "7px 14px",
    cursor: "pointer",
    letterSpacing: "0.1em",
    textTransform: "lowercase",
    transition: "all 0.15s",
  };
}