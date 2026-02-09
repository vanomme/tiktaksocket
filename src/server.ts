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
  console.log("Client connected:", socket.id);

  socket.on("login", (username: string) => {
    gameManager.addPlayer(socket.id, username);
    io.emit("update_players", gameManager.getAllPlayersWithStatus());
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    const gameId = gameManager.removePlayer(socket.id);
    if (gameId) {
      io.to(gameId).emit("game_over", { winner: "OPPONENT_DISCONNECTED" });
      io.socketsLeave(gameId);
    }
    io.emit("update_players", gameManager.getAllPlayersWithStatus());
  });

  socket.on("challenge", (targetId: string) => {
    if (targetId === socket.id) return;
    const challenger = gameManager.players.get(socket.id);
    if (challenger) {
      io.to(targetId).emit("challenge_received", {
        fromId: socket.id,
        username: challenger.username
      });
    }
  });

  socket.on("accept_challenge", (challengerId: string) => {
    const game = gameManager.createGame(challengerId, socket.id);
    if (game) {
      const p1Socket = io.sockets.sockets.get(challengerId);
      const p2Socket = io.sockets.sockets.get(socket.id);

      const joinGameRoom = (s: any, roomId: string) => {
        s.rooms.forEach((r: string) => {
          if (r !== s.id) s.leave(r);
        });
        s.join(roomId);
      };

      if (p1Socket) joinGameRoom(p1Socket, game.id);
      if (p2Socket) joinGameRoom(p2Socket, game.id);

      io.to(game.id).emit("game_start", {
        gameId: game.id,
        playerX: game.playerX,
        playerO: game.playerO,
        currentTurn: game.currentTurn
      });

      io.emit("update_players", gameManager.getAllPlayersWithStatus());
    }
  });

  socket.on("make_move", ({ gameId, index }: { gameId: string, index: number }) => {
    const game = gameManager.getGame(gameId);
    if (!game) return;

    if (game.makeMove(index, socket.id)) {
      io.to(gameId).emit("board_update", {
        board: game.board,
        currentTurn: game.currentTurn
      });

      if (game.winner) {
        if (game.winner === "DRAW") {
          io.to(gameId).emit("game_over", { winner: "DRAW" });
          setTimeout(() => {
            const winner = Math.random() < 0.5 ? game.playerX : game.playerO;
            io.to(gameId).emit("coin_toss_result", {
              winner,
              message: `Pile ou Face : Victoire de ${winner.username} !`
            });
            cleanUpGame(gameId);
          }, 2000);
        } else {
          io.to(gameId).emit("game_over", { winner: game.winner });
          cleanUpGame(gameId);
        }
      }
    }
  });

  socket.on("spectate", (targetId: string) => {
    const game = gameManager.getGameByPlayer(targetId);
    if (game) {
      socket.join(game.id);
      socket.emit("game_start", {
        gameId: game.id,
        playerX: game.playerX,
        playerO: game.playerO,
        currentTurn: game.currentTurn,
        board: game.board,
        isSpectator: true
      });
    }
  });

  function cleanUpGame(gameId: string) {
    const game = gameManager.getGame(gameId);
    if (game) {
      gameManager.games.delete(gameId);
      gameManager.playerGameMap.delete(game.playerX.id);
      gameManager.playerGameMap.delete(game.playerO.id);
      io.socketsLeave(gameId);
      io.emit("update_players", gameManager.getAllPlayersWithStatus());
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
