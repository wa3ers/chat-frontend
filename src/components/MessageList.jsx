import React, { useEffect, useRef } from "react";
import { useUser } from "../contexts/UserContext";

const styles = {
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: 12,
  },
  row: {
    display: "flex",
    width: "100%",
  },
  rowRight: { justifyContent: "flex-end" }, // benim mesajım
  rowLeft: { justifyContent: "flex-start" }, // diğerleri
  bubble: {
    maxWidth: "75%",
    padding: "10px 14px",
    borderRadius: 14,
    lineHeight: 1.5,
    fontSize: 15,
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
    textAlign: "left",
  },
  mine: {
    background: "#c7ffc1",
    color: "#111",
    borderTopRightRadius: 6,
  },
  theirs: {
    background: "#1e2f35",
    color: "#f1f1f1",
    borderTopLeftRadius: 6,
  },
  user: { fontWeight: 600, fontSize: 13, opacity: 0.85, marginBottom: 4 },
  text: { marginBottom: 4 },
  time: { fontSize: 12, opacity: 0.7, textAlign: "right" },
};

export default function MessageList() {
  const { messages, username } = useUser();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={styles.list}>
      {messages.length === 0 ? (
        <p>Henüz mesaj yok</p>
      ) : (
        messages.map((msg, i) => {
          const isMine = msg.user === username;
          return (
            <div
              key={i}
              style={{ 
                ...styles.row,
                ...(isMine ? styles.rowRight : styles.rowLeft)
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  ...(isMine ? styles.mine : styles.theirs),
                }}
              >
                <div style={styles.user}>{msg.user}</div>
                <div style={styles.text}>{msg.text}</div>
                <div style={styles.time}>{msg.time}</div>
              </div>
            </div>
          );
        })
      )}
      <div ref={endRef} />
    </div>
  );
}
