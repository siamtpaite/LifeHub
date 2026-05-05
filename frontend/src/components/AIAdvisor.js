import React, { useEffect, useRef, useState } from "react";

const SYSTEM_PROMPT = `You are LifeHub AI Advisor — a sharp, friendly personal finance and lifestyle assistant embedded inside the LifeHub app.

You have access to the user's real data which will be provided in each message as JSON context. Use it to give specific, actionable advice. Never be vague.

Your areas of expertise:
- Subscription analysis: spot wasteful spending, upcoming renewals, cheaper alternatives
- Warranty management: flag expiring warranties, remind about claims
- Skills marketplace: suggest skill exchanges, identify demand vs supply gaps
- Savings: calculate actual savings, project annual costs, suggest cuts
- Recall alerts: flag products the user owns that have known issues
- Enterprise insights: churn risk, tenant health, revenue forecasting

Tone: confident, concise, warm. Like a smart friend who happens to be a financial advisor.
Format: use short paragraphs. Use ₹ for INR. Bold key numbers or actions using **text**.
Never say "I don't have access to" — you always have the user's data in context.
Never ask for information the user has already provided in their data.
Keep responses under 200 words unless the user asks for detail.`;

const SUGGESTIONS = [
  "Which subscriptions should I cancel?",
  "What warranties are expiring soon?",
  "How much am I spending monthly?",
  "Any recalls on my products?",
  "Suggest a skill I should offer",
  "How can I save more this year?",
];

export default function AIAdvisor({ authContext, currency = "INR" }) {
  const { user, apiBaseUrl } = authContext;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  // Load all user data for context
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const t = await user.getIdToken();
        const headers = { Authorization: `Bearer ${t}` };
        const [subs, wars, skills, savings, recalls, predictions] = await Promise.allSettled([
          fetch(`${apiBaseUrl}/api/subscriptions`, { headers }).then(r => r.json()),
          fetch(`${apiBaseUrl}/api/warranties`, { headers }).then(r => r.json()),
          fetch(`${apiBaseUrl}/api/skills`, { headers }).then(r => r.json()),
          fetch(`${apiBaseUrl}/api/savings`, { headers }).then(r => r.json()),
          fetch(`${apiBaseUrl}/api/recalls`, { headers }).then(r => r.json()),
          fetch(`${apiBaseUrl}/api/predictions`, { headers }).then(r => r.json()),
        ]);
        setUserData({
          subscriptions: subs.status === "fulfilled" ? subs.value : [],
          warranties: wars.status === "fulfilled" ? wars.value : [],
          skills: skills.status === "fulfilled" ? skills.value : [],
          savings: savings.status === "fulfilled" ? savings.value : {},
          recalls: recalls.status === "fulfilled" ? recalls.value : {},
          predictions: predictions.status === "fulfilled" ? predictions.value : {},
          currency,
          user: { email: user.email, name: user.displayName },
        });
      } catch (e) {
        setError("Could not load your data for AI context.");
      }
    };
    loadUserData();
  }, [user, apiBaseUrl, currency]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");
    setError("");

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const contextBlock = userData
        ? `\n\n<user_data>\n${JSON.stringify(userData, null, 2)}\n</user_data>`
        : "";

      const apiMessages = newMessages.map((m, i) => ({
        role: m.role,
        content: i === 0 && m.role === "user"
          ? m.content + contextBlock
          : m.content,
      }));

      // Always include context in the latest user message
      if (apiMessages.length > 0) {
        const last = apiMessages[apiMessages.length - 1];
        if (last.role === "user" && !last.content.includes("<user_data>")) {
          last.content = last.content + contextBlock;
        }
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      const data = await response.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "Sorry, I couldn't generate a response.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setError("AI request failed. Please try again.");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, i) => {
    const isUser = msg.role === "user";
    return (
      <div key={i} style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 12,
      }}>
        {!isUser && (
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#a78bfa,#6d28d9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, marginRight: 8, marginTop: 2,
          }}>✦</div>
        )}
        <div style={{
          maxWidth: "78%",
          background: isUser
            ? "rgba(167,139,250,.2)"
            : "rgba(255,255,255,.06)",
          border: `1px solid ${isUser ? "rgba(167,139,250,.35)" : "rgba(255,255,255,.1)"}`,
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          padding: "10px 14px",
          fontSize: 13,
          color: "rgba(255,255,255,.9)",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
        }}>
          {/* Render bold text */}
          {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
            part.startsWith("**") && part.endsWith("**")
              ? <strong key={j} style={{ color: "#fff" }}>{part.slice(2, -2)}</strong>
              : part
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="panel-title">AI Advisor</div>
      <div className="panel-sub">Your personal finance and lifestyle intelligence, powered by Claude AI.</div>

      {/* Chat area */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        marginBottom: 12,
        paddingRight: 4,
        minHeight: 0,
      }}>
        {messages.length === 0 && (
          <div>
            <div style={{
              background: "rgba(167,139,250,.08)",
              border: "1px solid rgba(167,139,250,.2)",
              borderRadius: 12, padding: "14px 16px",
              marginBottom: 16, fontSize: 13,
              color: "rgba(255,255,255,.7)", lineHeight: 1.6,
            }}>
              ✦ I have access to your subscriptions, warranties, skills, savings and recall data. Ask me anything about your financial health or what to do next.
            </div>
            <div className="section-label" style={{ marginBottom: 10 }}>Suggestions</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)} style={{
                  background: "rgba(255,255,255,.07)",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: 20, padding: "6px 14px",
                  fontSize: 12, color: "rgba(255,255,255,.7)",
                  cursor: "pointer", fontFamily: "Inter,sans-serif",
                  transition: "all .15s",
                }}
                  onMouseOver={e => { e.target.style.background = "rgba(167,139,250,.2)"; e.target.style.borderColor = "rgba(167,139,250,.4)"; }}
                  onMouseOut={e => { e.target.style.background = "rgba(255,255,255,.07)"; e.target.style.borderColor = "rgba(255,255,255,.12)"; }}
                >{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map(renderMessage)}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg,#a78bfa,#6d28d9)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
            }}>✦</div>
            <div style={{
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: "16px 16px 16px 4px",
              padding: "10px 16px", fontSize: 13,
              color: "rgba(255,255,255,.4)",
            }}>
              Thinking…
            </div>
          </div>
        )}

        {error && <p style={{ color: "#ff5c5c", fontSize: 13, marginBottom: 8 }}>{error}</p>}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <input
          value={input}
          placeholder="Ask about your subscriptions, warranties, savings…"
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          style={{ flex: 1 }}
          disabled={loading}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{
            background: input.trim() ? "linear-gradient(135deg,#a78bfa,#6d28d9)" : "rgba(255,255,255,.08)",
            border: "none", borderRadius: 10, padding: "0 18px",
            color: "#fff", fontSize: 14, cursor: input.trim() ? "pointer" : "default",
            fontFamily: "Inter,sans-serif", flexShrink: 0,
            transition: "all .15s",
          }}
        >↑</button>
      </div>
    </>
  );
}
