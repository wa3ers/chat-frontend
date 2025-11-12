const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("Yeni kullanıcı bağlandı:", socket.id);

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg); // herkese gönder
  });

  socket.on("disconnect", () => {
    console.log("Kullanıcı ayrıldı:", socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`✅ Server ${PORT} portunda çalışıyor...`));
