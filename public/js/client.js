// @ts-ignore
import { elements, showScreen, resetBoardState, updateBoard, updateTurn, showCoinToss, showCoinResult, updatePlayerList, showChallengeModal, showNotification } from "./ui.js";
// @ts-ignore
const socket = io();
let currentGameId = null;
let myPlayerId = null;
let playerXName = "";
let playerOName = "";
// Ensure clean slate on load
resetBoardState();
showScreen("login-screen");
// Listeners
elements.loginBtn.addEventListener("click", () => {
    const name = elements.usernameInput.value.trim();
    if (name) {
        socket.emit("login", name);
        showScreen("lobby-screen");
        elements.currentUsername.textContent = name;
    }
});
elements.cells.forEach((c) => {
    c.addEventListener("click", () => {
        const index = c.getAttribute("data-index");
        if (currentGameId && index) {
            socket.emit("make_move", { gameId: currentGameId, index: parseInt(index) });
        }
        else {
            console.warn("Click ignored: No Active Game ID");
        }
    });
});
elements.closeModalBtn.addEventListener("click", () => {
    elements.coinTossModal.classList.add("hidden");
    resetBoardState();
    showScreen("lobby-screen");
});
// Socket Events
socket.on("connect", () => {
    myPlayerId = socket.id;
});
socket.on("update_players", (players) => {
    updatePlayerList(players, myPlayerId, (id) => socket.emit("challenge", id), (id) => socket.emit("spectate", id));
});
socket.on("challenge_received", (data) => {
    showChallengeModal(data.username, () => {
        socket.emit("accept_challenge", data.fromId);
    }, () => {
        // User declined the challenge
        console.log("Challenge declined");
    });
});
socket.on("game_start", (data) => {
    resetBoardState();
    currentGameId = data.gameId;
    playerXName = data.playerX.username;
    playerOName = data.playerO.username;
    showScreen("game-screen");
    if (data.isSpectator) {
        elements.gameStatus.textContent = "Spectateur";
        if (data.board)
            updateBoard(data.board);
    }
    else {
        elements.gameStatus.textContent = `Vs ${data.playerX.id === socket.id ? data.playerO.username : data.playerX.username}`;
    }
    updateTurn(data.currentTurn, data.currentTurn === "X" ? playerXName : playerOName);
});
socket.on("board_update", (data) => {
    updateBoard(data.board);
    updateTurn(data.currentTurn, data.currentTurn === "X" ? playerXName : playerOName);
});
socket.on("game_over", (data) => {
    if (data.winner === "DRAW") {
        showCoinToss();
    }
    else {
        const message = data.winner === "OPPONENT_DISCONNECTED" ? "Adversaire deconnecte !" : `Victoire: ${data.winner}`;
        showNotification("Fin de partie", message, () => {
            if (data.winner !== "DRAW") {
                resetBoardState();
                showScreen("lobby-screen");
            }
        });
    }
});
socket.on("coin_toss_result", (data) => {
    showCoinResult(data.winner.username, data.message);
});
