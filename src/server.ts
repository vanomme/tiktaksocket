import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, "..", "public");

app.use(express.static(publicDir));

io.on("connection", (socket) => {
  console.log("Client connecte:", socket.id);
  socket.emit("hello", "Hello World depuis le serveur");

  socket.on("hello", (msg: string) => {
    console.log("Message du client:", msg);
  });
});

server.listen(PORT, () => {
  console.log(`Serveur demarre sur http://localhost:${PORT}`);
});
