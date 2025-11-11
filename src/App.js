import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://chat-backend1-ai8g.onrender.com", {
  transports: ["websocket"],
});

function App() {
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [tempName, setTempName] = useState("");
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [notifAllowed, setNotifAllowed] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    socket.on("chat message", (msgObj) => {
      setMessages((prev) => [...prev, msgObj]);

      if (notifAllowed && document.hidden) {
        new Notification(`${msgObj.username}: ${msgObj.text}`);
      }

      if (audioReady) {
        audioRef.current?.play?.();
      }
    });

    return () => socket.off("chat message");
  }, [notifAllowed, audioReady]);

  const requestPermission = () => {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") {
        setNotifAllowed(true);
      }
    });
  };

  const enableSound = () => {
    audioRef.current.play().then(() => {
      setAudioReady(true);
    });
  };

  const saveName = () => {
    if (tempName.trim().length > 0) {
      setUsername(tempName);
      localStorage.setItem("username", tempName);
    }
  };

  const sendMessage = () => {
    if (!msg.trim() || !username.trim()) return;
    socket.emit("chat message", { username, text: msg });
    setMsg("");
  };

  if (!username) {
    return (
      <div style={{ padding: 20 }}>
        <h2>İsminizi girin:</h2>
        <input
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
        />
        <button onClick={saveName}>Kaydet</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Hoş geldin, {username}</h2>

      <div style={{ marginBottom: 10 }}>
        <button onClick={requestPermission}>🔔 Bildirim Aç</button>
        <button onClick={enableSound}>🔊 Ses Aç</button>
      </div>

      <audio ref={audioRef} src="/notify.mp3" preload="auto" />

      <div
        style={{
          height: "400px",
          border: "1px solid #ccc",
          overflowY: "auto",
          padding: 10,
          marginBottom: 10,
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.username}:</b> {m.text}
          </div>
        ))}
      </div>

      <input
        style={{ width: "80%" }}
        placeholder="Mesaj yaz..."
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
      />
      <button onClick={sendMessage}>Gönder</button>
    </div>
  );
}

export default App;
