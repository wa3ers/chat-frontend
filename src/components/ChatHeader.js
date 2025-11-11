import React from "react";

const ChatHeader = ({ username }) => {
  return (
    <div style={styles.header}>
      <div style={styles.avatar}>{username?.charAt(0).toUpperCase()}</div>
      <span style={styles.name}>{username}</span>
    </div>
  );
};

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    background: "#128c7e",
    color: "white",
    fontWeight: "bold",
    fontSize: "20px",
  },
  avatar: {
    background: "#075e54",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "10px",
    fontSize: "18px",
    fontWeight: "bold",
  },
  name: {
    fontSize: "18px",
    fontWeight: "bold",
  },
};

export default ChatHeader;
