import React, { useState } from "react";
import { useUser } from "../contexts/UserContext";
import "./LoginModal.css";

const LoginModal = () => {
  const { chooseUsername, username } = useUser();
  const [name, setName] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (name.trim()) {
      chooseUsername(name);
    }
  };

  if (username) return null;

  return (
    <div className="login-overlay">
      <div className="login-box">
        <h3>Hoş geldin 👋</h3>
        <p>Sohbete katılmak için kullanıcı adını yaz:</p>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Kullanıcı adın..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="login-input"
          />
          <button type="submit" className="login-btn">
            Başla
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
