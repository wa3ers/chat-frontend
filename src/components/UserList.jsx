import React from "react";
import { useUser } from "../contexts/UserContext";

const UserList = () => {
  const { onlineUsers } = useUser();

  return (
    <div style={{ color: "white", padding: "10px" }}>
      <h3>Kullanıcılar</h3>
      {onlineUsers.length === 0 ? (
        <p>Henüz kimse çevrimiçi değil</p>
      ) : (
        <ul>
          {onlineUsers.map((user, i) => (
            <li key={i}>🟢 {user}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList;
