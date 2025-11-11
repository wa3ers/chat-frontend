import React from "react";

const timeOf = (ts) => {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

export default function MessageRow({ msg, isMe }) {
  return (
    <div className={`row ${isMe ? "me" : "other"}`}>
      {!isMe && <div className="bubble-name">{msg.user}</div>}
      <div className={`bubble ${isMe ? "mine" : "theirs"}`}>
        <div className="bubble-text">{msg.text}</div>
        <div className="bubble-meta">{timeOf(msg.ts)}</div>
      </div>
    </div>
  );
}
