import React, { useState } from "react";
import { useUser } from "../contexts/UserContext";

const MessageInput = () => {
  const { sendMessage, username } = useUser(); // ✅ addMessage yerine sendMessage
  const [text, setText] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessage(text); // ✅ burası da düzeltildi
      setText("");
    }
  };

  return (
    <form onSubmit={handleSend} className="message-input">
      <input
        type="text"
        placeholder={`Mesaj yazın... (${username || "anonim"})`}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Gönder</button>
    </form>
  );
};

export default MessageInput;
