import React, { useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import "./styles.css";

// ✅ Backend URL’in (Render)
const BACKEND_URL = "https://chat-backend1-aib9.onrender.com";

export default function App() {
  const [username, setUsername] = useState(() => {
    const saved = localStorage.getItem("username");
    return saved || "";
  });
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  const socket = useMemo(() => io(BACKEND_URL, { transports: ["websocket"] }), []);
  const bottomRef = useRef(null);

  // İlk girişte kullanıcı adını al
  useEffect(() => {
    if (!username) {
      const u = prompt("Kullanıcı adın?")?.trim() || "Anonim";
      setUsername(u);
      localStorage.setItem("username", u);
    }
  }, [username]);

  // Socket bağlan & event’ler
  useEffect(() => {
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("chatMessage");
      socket.close();
    };
  }, [socket]);

  // Her mesaj sonrası en alta kaydır
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text) => {
    const clean = text.trim();
    if (!clean) return;

    const payload = {
      user: username || "Anonim",
      text: clean,
      ts: Date.now(),
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    };

    // Optimistic UI: önce ekranda göster, sonra emit et
    setMessages((prev) => [...prev, payload]);
    socket.emit("chatMessage", payload);
  };

  return (
    <div className="chat-page">
      <div className="chat-card">
        <ChatHeader
          title="Sohbet"
          subtitle={connected ? "Çevrimiçi" : "Bağlantı yok"}
          me={username || "Anonim"}
          online={connected}
        />

        <MessageList
          messages={messages}
          me={username}
          bottomRef={bottomRef}
        />

        <MessageInput onSend={sendMessage} />
      </div>
    </div>
  );
}
