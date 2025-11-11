import React, { useState } from "react";

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    onSend(text);
    setText("");
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-area">
      <button className="icon-btn" title="Emoji">😊</button>
      <textarea
        className="input"
        placeholder="Mesaj yazın…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        rows={1}
      />
      <button className="send-btn" onClick={handleSend}>
        Gönder
      </button>
    </div>
  );
}
