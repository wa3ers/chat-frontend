import React from "react";

const initials = (name) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function ChatHeader({ title, subtitle, me, online }) {
  return (
    <header className="chat-header">
      <div className="chat-header-left">
        <div className="avatar">
          <span>{initials(me || "A")}</span>
          <span className={`status-dot ${online ? "on" : "off"}`} />
        </div>
        <div>
          <div className="title">{title}</div>
          <div className="subtitle">
            {subtitle} · <b>{me}</b>
          </div>
        </div>
      </div>
      <div className="chat-header-right">
        <button className="icon-btn" title="Ara">
          📞
        </button>
        <button className="icon-btn" title="Bilgi">
          ℹ️
        </button>
      </div>
    </header>
  );
}
