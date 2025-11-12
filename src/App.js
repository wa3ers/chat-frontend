import React from "react";
import { UserProvider } from "./contexts/UserContext";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import LoginModal from "./components/LoginModal";
import UserList from "./components/UserList"; // 👈 yeni listeyi dahil ettik
import "./styles.css";

const AppInner = () => {
  return (
    <div className="app-wrapper" style={{ display: "flex", height: "100vh" }}>
      {/* 👈 Sol panel: Kullanıcı listesi */}
      <div
        style={{
          width: "250px",
          backgroundColor: "#0f2426",
          borderRight: "1px solid #164045",
          color: "#fff",
        }}
      >
        <UserList />
      </div>

      {/* 👉 Sağ panel: Sohbet alanı */}
      <div className="chat-container" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <ChatHeader />
        <div className="chat-body" style={{ flex: 1, overflowY: "auto" }}>
          <MessageList />
        </div>
        <MessageInput />
        <LoginModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <UserProvider>
      <AppInner />
    </UserProvider>
  );
}
