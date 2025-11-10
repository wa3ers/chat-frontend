import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

// Backend URL'in (şu an çalışan)
const socket = io("https://chat-backend-cisd.onrender.com", {
  transports: ["websocket", "polling"],
});

export default function App() {
  const [username, setUsername] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  // Bildirim & ses durumları
  const [notifGranted, setNotifGranted] = useState(
    typeof Notification !== "undefined" ? Notification.permission === "granted" : false
  );
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef(null); // public/notify.mp3 çalmak için

  // Socket dinleyicileri
  useEffect(() => {
    socket.on("connect", () => {
      // console.log("Bağlandı");
    });

    socket.on("chat message", (msg) => {
      setChat((prev) => [...prev, msg]);

      // 1) Tarayıcı bildirimi (izin varsa ve mesaj başkasından geldiyse)
      if (notifGranted && msg?.user !== username) {
        try {
          new Notification(`${msg.user || "Yeni mesaj"}`, {
            body: msg.text || "",
          });
        } catch {}
      }

      // 2) Ses (kullanıcı butona bastıysa ve mesaj başkasından geldiyse)
      if (soundEnabled && audioRef.current && msg?.user !== username) {
        // iOS/Safari/Chrome autoplay kısıtları için kullanıcı tıklaması sonrası çalışır
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    });

    return () => {
      socket.off("chat message");
      socket.off("connect");
    };
  }, [notifGranted, soundEnabled, username]);

  // Kullanıcı adını onayla
  const handleReady = (e) => {
    e.preventDefault();
    const name = username.trim() || "Kullanıcı";
    setUsername(name);
    setIsReady(true);
    socket.emit("user ready", name);
  };

  // Mesaj gönder
  const sendMessage = (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    const msg = { user: username || "Anonim", text };
    socket.emit("chat message", msg);
    setMessage("");
  };

  // 🔔 Bildirim & Ses Aç butonu
  const enableNotifAndSound = async () => {
    // 1) Bildirim izni
    if (typeof Notification !== "undefined") {
      try {
        const perm = await Notification.requestPermission();
        setNotifGranted(perm === "granted");
      } catch {
        setNotifGranted(false);
      }
    }
    // 2) Ses (autoplay için kullanıcı etkileşimi şart, bu buton tıklaması yeter)
    try {
      if (audioRef.current) {
        await audioRef.current.play(); // kısa çal, sonra hemen durdur
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setSoundEnabled(true);
    } catch {
      // Sessizce geç
      setSoundEnabled(false);
    }
  };

  // UI
  return (
    <div style={{ padding: "16px", maxWidth: 720, margin: "0 auto", fontFamily: "system-ui, Arial" }}>
      <h1 style={{ marginBottom: 8 }}>Sohbet</h1>

      {/* 🔔 Bildirim & Ses kontrolü - HER ZAMAN GÖRÜNSÜN */}
      <div style={{ margin: "8px 0 16px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={enableNotifAndSound}
          style={{
            background: notifGranted || soundEnabled ? "#16a34a" : "#2563eb",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
          title="Tarayıcı bildirimi izni iste ve bildirim sesini etkinleştir"
        >
          🔔 Bildirim & Ses Aç
        </button>

        <span style={{ fontSize: 13, color: "#555" }}>
          Bildirim: <b>{notifGranted ? "Açık" : "Kapalı"}</b> • Ses: <b>{soundEnabled ? "Açık" : "Kapalı"}</b>
        </span>
      </div>

      {/* Ses dosyası (public/notify.mp3) */}
      <audio ref={audioRef} src="/notify.mp3" preload="auto" />

      {!isReady ? (
        <form onSubmit={handleReady} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Kullanıcı adın"
            style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
          <button
            type="submit"
            style={{
              background: "#111827",
              color: "#fff",
              border: "none",
              padding: "10px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Başla
          </button>
        </form>
      ) : (
        <>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              height: 360,
              overflowY: "auto",
              marginBottom: 12,
              background: "#fafafa",
            }}
          >
            {chat.length === 0 ? (
              <div style={{ color: "#666" }}>Henüz mesaj yok.</div>
            ) : (
              chat.map((c, i) => (
                <div
                  key={i}
                  style={{
                    margin: "8px 0",
                    display: "flex",
                    justifyContent: c.user === username ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      background: c.user === username ? "#dbeafe" : "#e5e7eb",
                      borderRadius: 12,
                      padding: "8px 12px",
                      maxWidth: "80%",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    <div style={{ fontSize: 12, color: "#374151", marginBottom: 4 }}>
                      <b>{c.user || "Anonim"}</b>
                    </div>
                    <div style={{ fontSize: 15 }}>{c.text}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mesaj yaz…"
              style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
            <button
              type="submit"
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "10px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Gönder
            </button>
          </form>
        </>
      )}
    </div>
  );
}
