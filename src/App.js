import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import notifySound from "./notify.mp3";

//  ✅ Backend URL
const socket = io("https://chat-backend1-aib9.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [inputName, setInputName] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const audioRef = useRef(null);
  const scrollRef = useRef(null);

  // ✅ Scroll hep aşağı insin
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  // ✅ Bildirim göster
  const showNotification = (title, body) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    }
  };

  // ✅ Socket mesaj dinleme
  useEffect(() => {
    audioRef.current = new Audio(notifySound);

    socket.on("chat message", (msg) => {
      setChat((prev) => [...prev, msg]);

      if (msg.user !== username) {
        audioRef.current.play().catch(() => {});
        showNotification(msg.user, msg.text);
      }
    });

    return () => socket.off("chat message");
  }, [username]);

  // ✅ Mesaj gönder
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msg = { user: username, text: message };
    socket.emit("chat message", msg);
    setMessage("");
  };

  // ✅ İsim girilmemişse kullanıcı adını iste
  if (!username) {
    return (
      <div style={styles.centerBox}>
        <h2>Kullanıcı adını yaz</h2>

        <input
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder="Adınız..."
          style={styles.input}
        />

        <button
          onClick={() => setUsername(inputName)}
          style={styles.button}
        >
          Giriş
        </button>

        <br />
        <button
          onClick={() => Notification.requestPermission()}
          style={styles.notif}
        >
          🔔 Bildirim Aç
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Hoşgeldin {username} 👋</h2>

      <button
        onClick={() => Notification.requestPermission()}
        style={styles.notif}
      >
        🔔 Bildirim Aç
      </button>

      <div ref={scrollRef} style={styles.chatBox}>
        {chat.map((c, i) => (
          <div key={i} style={c.user === username ? styles.myMsg : styles.otherMsg}>
            <b>{c.user}:</b> {c.text}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={styles.form}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mesaj yaz..."
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Gönder
        </button>
      </form>
    </div>
  );
}

export default App;

/* ✅ Basit stiller */
const styles = {
  container: {
    padding: "20px",
    maxWidth: "500px",
    margin: "auto",
    textAlign: "center",
  },
  chatBox: {
    border: "1px solid #ccc",
    height: "330px",
    overflowY: "auto",
    padding: "10px",
    marginBottom: "10px",
  },
  myMsg: {
    textAlign: "right",
    margin: "5px 0",
    color: "blue",
  },
  otherMsg: {
    textAlign: "left",
    margin: "5px 0",
  },
  form: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "8px",
  },
  button: {
    padding: "8px 15px",
  },
  notif: {
    padding: "5px 10px",
    marginBottom: "10px",
  },
  centerBox: {
    padding: "40px",
    textAlign: "center",
  },
};
