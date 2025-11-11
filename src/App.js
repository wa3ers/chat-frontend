import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://chat-backend-cisd.onrender.com");

function App() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const audioRef = useRef(null);
  const msgEndRef = useRef(null);

  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      if (notifyEnabled && msg.user !== username) {
        playSound();
        showNotification(msg);
      }
    });

    return () => {
      socket.off("message");
    };
  }, [notifyEnabled, username]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinChat = () => {
    if (!username.trim()) return;
    setReady(true);
    socket.emit("join", username);
  };

  const sendMessage = () => {
    if (!text.trim()) return;
    socket.emit("message", { user: username, text });
    setText("");
  };

  const enableNotifications = async () => {
    try {
      const audio = audioRef.current;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;

      setNotifyEnabled(true);
      Notification.requestPermission();
      alert("✅ Bildirim & Ses aktif!");
    } catch (err) {
      alert("⚠️ Ses için önce ekrana tıklaman lazım!");
    }
  };

  const playSound = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 1;
      audio.play();
    }
  };

  const showNotification = (msg) => {
    if (Notification.permission === "granted") {
      new Notification(`💬 ${msg.user}`, {
        body: msg.text,
      });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {!ready ? (
        <div>
          <h2>Kullanıcı adı gir</h2>
          <input
            placeholder="Ad..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <br />
          <br />
          <button onClick={joinChat}>Giriş</button>
        </div>
      ) : (
        <>
          <h1>Chat</h1>

          {/* SES & BİLDİRİM butonu */}
          {!notifyEnabled && (
            <button
              onClick={enableNotifications}
              style={{
                padding: "8px 14px",
                background: "#1976d2",
                color: "white",
                border: 0,
                borderRadius: 6,
                cursor: "pointer",
                marginBottom: 10,
              }}
            >
              🔔 Bildirim & Ses Aç
            </button>
          )}

          <audio ref={audioRef} src="/notify.mp3" preload="auto"></audio>

          <div
            style={{
              border: "1px solid #aaa",
              height: 300,
              overflowY: "scroll",
              padding: 10,
            }}
          >
            {messages.map((m, i) => (
              <div key={i}>
                <b>{m.user}:</b> {m.text}
              </div>
            ))}
            <div ref={msgEndRef} />
          </div>

          <input
            placeholder="Mesaj yaz..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: 250, marginTop: 10 }}
          />
          <button onClick={sendMessage}>Gönder</button>
        </>
      )}
    </div>
  );
}

export default App;
