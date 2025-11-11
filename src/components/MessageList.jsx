import React from "react";
import MessageRow from "./MessageRow";

export default function MessageList({ messages, me, bottomRef }) {
  return (
    <div className="messages">
      {messages.map((m) => (
        <MessageRow key={m.id || m.ts} msg={m} isMe={m.user === me} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
