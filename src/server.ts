import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { GameManager } from "./gameManager";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, "..", "public");

app.use(express.static(publicDir));

const gameManager = new GameManager();

io.on("connection", (socket) => {
  console.log("Client connecte:", socket.id);

  // Initial login (simplified for now, real login logic comes later with Dev 3)
  socket.on("login", (username: string) => {
    gameManager.addPlayer(socket.id, username);
    console.log(`User logged in: ${username} (${socket.id})`);
    io.emit("update_players", gameManager.getAvailablePlayers(socket.id));
  });

  socket.on("disconnect", () => {
    console.log("Client deconnecte:", socket.id);
    const gameId = gameManager.removePlayer(socket.id);
    if (gameId) {
      // Notify other player in game, end game, etc. (Dev 3 task)
      io.to(gameId).emit("game_over", { winner: "OPPONENT_DISCONNECTED" });
    }
    // Broadcast updated player list
    io.emit("update_players", gameManager.getAvailablePlayers(socket.id)); // socket.id is gone, but for type safety logic
  });
});

server.listen(PORT, () => {
  console.log(`Serveur demarre sur http://localhost:${PORT}`);
});
