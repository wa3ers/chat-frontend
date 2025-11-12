import React from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import "./ChatWindow.css";

const ChatWindow = () => {
  return (
    <div className="chat-window">
      <ChatHeader />
      <MessageList />
      <MessageInput />
    </div>
  );
};

export default ChatWindow;
