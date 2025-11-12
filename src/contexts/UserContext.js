import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// 🌐 Socket bağlantısı
const socket = io("http://localhost:10000", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  path: "/socket.io",
});

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // 📡 Socket olaylarını dinle
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket bağlandı:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket bağlantısı koptu");
    });

    socket.on("onlineUsers", (users) => {
      console.log("🧠 Güncel kullanıcı listesi:", users);
      setOnlineUsers(users || []);
    });

    socket.on("message", (msg) => {
      console.log("💬 Yeni mesaj alındı:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    // cleanup
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("onlineUsers");
      socket.off("message");
    };
  }, []);

  // 🧍 Kullanıcı adı seçimi
  const chooseUsername = (name) => {
    if (!name.trim()) return;
    setUsername(name);
    socket.emit("setUsername", name);
    console.log("🟢 Kullanıcı adı gönderildi:", name);
  };

  // 💬 Mesaj gönder
  const sendMessage = (text) => {
    if (!text.trim() || !username) return;
    const msg = {
      user: username,
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    socket.emit("message", msg);
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <UserContext.Provider
      value={{
        username,
        chooseUsername,
        sendMessage,
        messages,
        onlineUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
