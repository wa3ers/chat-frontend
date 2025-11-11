import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

// 🔗 Backend URL'in (Render)
const BACKEND_URL = "https://chat-backend-cisd.onrender.com";

function App() {
  // ----- state'ler
  const [username, setUsername] = useState("");
  const [tempName, setTempName] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  // ----- refs (tekrar yaratılmasınlar)
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const [notifyEnabled, setNotifyEnabled] = useState(false);

  // ----- socket kurulumu (SADECE 1 KEZ)
  useEffect(() => {
    // Socket'i tekil yarat
    if (!socketRef.current) {
      socketRef.current = io(BACKEND_URL, {
        // WebSocket olmazsa polling'e düşsün (CDN / kurumsal ağ engellerine dayanıklı)
        transports: ["websocket", "polling"],
        withCredentials: false,
      });

      // Mesaj dinleyicisi
      socketRef.current.on("chat message", (msg) => {
        console.log("📥 Alınan mesaj:", msg);
        setChat((prev) => [...prev, msg]);

        // Bildirim + ses (isteğe bağlı)
        if (notifyEnabled) {
          try {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(() => {});
            }
            if (document.hidden && "Notification" in window) {
              new Notification(`${msg.user}`, { body: msg.text });
            }
          } catch {
            /* sessiz geç */
          }
        }
      });

      socketRef.current.on("connect", () => {
        console.log("✅ Socket bağlandı:", socketRef.current.id);
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("❌ Socket connect_error:", err?.message || err);
      });
    }

    // Temizlik (komponent unmount)
    return () => {
      if (socketRef.current) {
        socketRef.current.off("chat message");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [notifyEnabled]);

  // ----- bildirim izni
  const enableNotification = async () => {
    try {
      if ("Notification" in window) {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          setNotifyEnabled(true);
          if (audioRef.current) {
            await audioRef.current.play().catch(() => {});
          }
        } else {
          alert("Bildirim izni verilmedi.");
        }
      } else {
        alert("Tarayıcı bildirimleri desteklemiyor.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ----- isim belirleme
  const handleSetName = () => {
    if (!tempName.trim()) return;
    setUsername(tempName.trim());
  };

  // ----- mesaj gönder
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msg = { user: username || "Anonim", text: message };
    console.log("📤 Gönderilen mesaj:", msg);
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("chat message", msg);
    } else {
      console.warn("Socket bağlı değil; mesaj gönderilemedi!");
    }
    setMessage("");
  };

  // ----- username ekranı
  if (!username) {
    return (
      <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ marginBottom: 12 }}>Kullanıcı Adı</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="Adın..."
            style={{
              flex: 1,
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 8,
            }}
          />
          <button
            onClick={handleSetName}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Giriş
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 720, margin: "0 auto" }}>
      {/* Bildirim + Ses */}
      <audio ref={audioRef} src="/notify.mp3" preload="auto" />
      {!notifyEnabled && (
        <button
          onClick={enableNotification}
          style={{
            padding: "10px 12px",
            background: "#f59e0b",
            border: "none",
            color: "#111",
            borderRadius: 8,
            marginBottom: 12,
            cursor: "pointer",
          }}
        >
          🔔 Bildirim & Ses Aç
        </button>
      )}

      <h2 style={{ margin: "8px 0 16px" }}>Merhaba, {username}</h2>

      {/* Mesaj listesi */}
      <div
        style={{
          border: "1px solid #ddd",
          height: 360,
          overflowY: "auto",
          padding: 12,
          borderRadius: 8,
          background: "#fafafa",
        }}
      >
        {chat.length === 0 ? (
          <div style={{ color: "#777" }}>
            Henüz mesaj yok. İlk mesajı sen yaz 😊
          </div>
        ) : (
          chat.map((c, i) => (
            <div
              key={i}
              style={{
                padding: "6px 8px",
                marginBottom: 6,
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 6,
              }}
            >
              <b>{c.user}:</b> {c.text}
            </div>
          ))
        )}
      </div>

      {/* Mesaj formu */}
      <form onSubmit={sendMessage} style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mesaj yaz…"
          style={{
            flex: 1,
            padding: 12,
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
        />
        <button
          type="submit"
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            background: "#16a34a",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Gönder
        </button>
      </form>
    </div>
  );
}

export default App;
