import React, { useEffect, useRef, useState } from "react";
import {
  collection, addDoc, query, orderBy,
  limit, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const ROOMS = [
  { id: "general", label: "# general", desc: "Open discussion" },
  { id: "design", label: "# design", desc: "UI/UX, Figma, branding" },
  { id: "dev", label: "# development", desc: "Code, debugging, APIs" },
  { id: "finance", label: "# finance", desc: "Tax, investing, accounting" },
  { id: "creative", label: "# creative", desc: "Video, music, writing" },
  { id: "offers", label: "# skill-offers", desc: "Post your skills here" },
];

export default function SkillsChat({ authContext }) {
  const { user } = authContext;
  const [room, setRoom] = useState("general");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [onlineCount] = useState(Math.floor(Math.random() * 40) + 12);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Real-time Firestore listener
  useEffect(() => {
    const q = query(
      collection(db, "skillsChat", room, "messages"),
      orderBy("createdAt", "asc"),
      limit(100)
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [room]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    try {
      await addDoc(collection(db, "skillsChat", room, "messages"), {
        text,
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        userPhoto: user.photoURL || null,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Failed to send:", e);
    }
  };

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const formatTime = ts => {
    if (!ts?.toDate) return "";
    return ts.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getInitial = name => (name || "?")[0].toUpperCase();

  const getColor = userId => {
    const colors = ["#a78bfa","#60a5fa","#4ade80","#fbbf24","#f472b6","#34d399","#fb923c"];
    let hash = 0;
    for (let i = 0; i < (userId||"").length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const isOwnMessage = msg => msg.userId === user.uid;

  // Group consecutive messages from same user
  const grouped = messages.reduce((acc, msg, i) => {
    const prev = messages[i - 1];
    const sameUser = prev && prev.userId === msg.userId;
    const within2min = prev && msg.createdAt && prev.createdAt &&
      (msg.createdAt?.seconds - prev.createdAt?.seconds) < 120;
    acc.push({ ...msg, showHeader: !sameUser || !within2min });
    return acc;
  }, []);

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>

      {/* Sidebar — rooms */}
      <div style={{
        width: 180, flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,.07)",
        padding: "20px 0",
        display: "flex", flexDirection: "column", gap: 2,
        overflowY: "auto",
      }}>
        <div style={{ padding: "0 14px 12px", fontSize: 11, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".08em" }}>
          Skills Chat
        </div>
        {ROOMS.map(r => (
          <button key={r.id} onClick={() => setRoom(r.id)} style={{
            background: room === r.id ? "rgba(45,212,191,.15)" : "none",
            border: "none", borderRadius: 8,
            padding: "7px 14px", textAlign: "left",
            cursor: "pointer", fontFamily: "Inter,sans-serif",
            color: room === r.id ? "#2dd4bf" : "rgba(255,255,255,.4)",
            fontSize: 13, transition: "all .15s",
            borderLeft: room === r.id ? "2px solid #2dd4bf" : "2px solid transparent",
          }}
            onMouseOver={e => { if (room !== r.id) e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}
            onMouseOut={e => { if (room !== r.id) e.currentTarget.style.color = "rgba(255,255,255,.4)"; }}
            title={r.desc}
          >
            {r.label}
          </button>
        ))}

        {/* Online indicator */}
        <div style={{ marginTop: "auto", padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }}/>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>{onlineCount} online</span>
          </div>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: getColor(user.uid),
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: "#000",
              overflow: "hidden",
            }}>
              {user.photoURL
                ? <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                : getInitial(user.displayName || user.email)}
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>
              {(user.displayName || user.email?.split("@")[0] || "You").slice(0, 14)}
            </span>
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Room header */}
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,.07)",
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>
            {ROOMS.find(r => r.id === room)?.label}
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>
            — {ROOMS.find(r => r.id === room)?.desc}
          </span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {grouped.length === 0 && (
            <div style={{
              textAlign: "center", padding: "40px 20px",
              color: "rgba(255,255,255,.3)", fontSize: 13,
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>👋</div>
              No messages yet. Start the conversation!
            </div>
          )}
          {grouped.map(msg => (
            <div key={msg.id} style={{ marginBottom: msg.showHeader ? 12 : 3 }}>
              {msg.showHeader && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: getColor(msg.userId),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, color: "#000", overflow: "hidden",
                  }}>
                    {msg.userPhoto
                      ? <img src={msg.userPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                      : getInitial(msg.userName)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: isOwnMessage(msg) ? "#2dd4bf" : getColor(msg.userId),
                      }}>{msg.userName}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,.25)" }}>{formatTime(msg.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,.8)", lineHeight: 1.55, wordBreak: "break-word" }}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              )}
              {!msg.showHeader && (
                <div style={{ paddingLeft: 42, fontSize: 13, color: "rgba(255,255,255,.8)", lineHeight: 1.55, wordBreak: "break-word" }}>
                  {msg.text}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,.07)",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 12, padding: "8px 14px",
          }}>
            <input
              ref={inputRef}
              value={input}
              placeholder={`Message ${ROOMS.find(r => r.id === room)?.label}…`}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              style={{
                flex: 1, background: "none", border: "none",
                color: "#fff", fontSize: 13, fontFamily: "Inter,sans-serif",
                outline: "none", padding: 0,
              }}
            />
            <button onClick={send} disabled={!input.trim()} style={{
              background: input.trim() ? "linear-gradient(135deg,#2dd4bf,#0f766e)" : "rgba(255,255,255,.08)",
              border: "none", borderRadius: 8, width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: input.trim() ? "pointer" : "default",
              color: "#fff", fontSize: 14, flexShrink: 0,
              transition: "all .15s",
            }}>↑</button>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.2)", marginTop: 6, textAlign: "center" }}>
            Enter to send · Be respectful · No spam
          </div>
        </div>
      </div>
    </div>
  );
}
