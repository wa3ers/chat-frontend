// src/App.js
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import notifySound from "./notify.mp3"; // MP3 artık src klasöründe

// Backend URL'in (Render)
const socket = io("https://chat-backend1-aib9.onrender.com", {
  transports: ["websocket", "polling"],
});

export default function App() {
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef(null);

  // Bildirim izni
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Socket dinleyicileri
  useEffect(() => {
    socket.on("connect", () => {
      if (username) socket.emit("user ready", username);
    });

    socket.on("chat message", (msg) => {
      setChat((prev) => [...prev, msg]);

      const fromOther = !username || msg.user !== username;
      if (fromOther) {
        // Sekme arkadaysa tarayıcı bildirimi
        if (
          "Notification" in window &&
          Notification.permission === "granted" &&
          document.hidden
        ) {
          new Notification(`${msg.user}`, { body: msg.text });
        }
        // Ses
        if (audioRef.current && audioReady) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      }
    });

    return () => {
      socket.off("connect");
      socket.off("chat message");
    };
  }, [username, audioReady]);

  // Sesi kilitten çıkar (ilk etkileşimde bir kez)
  const unlockAudio = () => {
    if (!audioRef.current) return;
    // Kısa bir “play & pause” hilesi
    audioRef.current.muted = false;
    audioRef.current.volume = 1;
    audioRef.current
      .play()
      .then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setAudioReady(true);
      })
      .catch(() => {
        // Bazı tarayıcılarda bir daha denemek için buton görünür kalır
      });
  };

  const submitUsername = (e) => {
    e.preventDefault();
    const name = username.trim() || "Anonim";
    setUsername(name);
    localStorage.setItem("username", name);
    socket.emit("user ready", name);
    unlockAudio(); // kullanıcı adı girince kesin etkileşim var
  };

  const sendMessage = (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    const name = username || "Anonim";
    const msg = { user: name, text };
    socket.emit("chat message", msg);
    setMessage("");
  };

  // Basit UI
  return (
    <div
      onClick={() => {
        if (!audioReady) unlockAudio();
      }}
      style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}
    >
      {/* Gizli ses oynatıcı */}
      <audio ref={audioRef} src={notifySound} preload="auto" />

      <h1>Chat</h1>

      {!username ? (
        <form onSubmit={submitUsername} style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Kullanıcı adı..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: 8, width: 240, marginRight: 8 }}
          />
          <button type="submit">Giriş</button>
          {!audioReady && (
            <button type="button" onClick={unlockAudio} style={{ marginLeft: 8 }}>
              🔔 Sesi Aç
            </button>
          )}
        </form>
      ) : (
        <div style={{ marginBottom: 12 }}>
          <b>Hoş geldin:</b> {username}{" "}
          {!audioReady && (
            <button onClick={unlockAudio} style={{ marginLeft: 8 }}>
              🔔 Bildirim Sesini Aç
            </button>
          )}
        </div>
      )}

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 6,
          padding: 12,
          height: 300,
          overflowY: "auto",
          marginBottom: 12,
          background: "#fff",
        }}
      >
        {chat.map((c, i) => (
          <div key={i}>
            <b>{c.user}:</b> {c.text}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Mesaj yaz..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ padding: 8, width: 260, marginRight: 8 }}
          onFocus={() => {
            // odak da bir etkileşim sayılır
            if (!audioReady) unlockAudio();
          }}
        />
        <button type="submit">Gönder</button>
      </form>
    </div>
  );
}
