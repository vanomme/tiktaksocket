// @ts-ignore
import { elements, showScreen, resetBoardState, updateBoard, updateTurn, showCoinToss, showCoinResult, updatePlayerList } from "./ui.js";

// @ts-ignore
const socket = io();

let currentGameId: string | null = null;
let myPlayerId: string | null = null;
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

elements.cells.forEach((c: Element) => {
    c.addEventListener("click", () => {
        const index = c.getAttribute("data-index");
        if (currentGameId && index) {
            socket.emit("make_move", { gameId: currentGameId, index: parseInt(index) });
        } else {
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

socket.on("update_players", (players: any[]) => {
    updatePlayerList(players, myPlayerId!,
        (id) => socket.emit("challenge", id),
        (id) => socket.emit("spectate", id)
    );
});

socket.on("challenge_received", (data: any) => {
    if (confirm(`${data.username} vous defie !`)) {
        socket.emit("accept_challenge", data.fromId);
    }
});

socket.on("game_start", (data: any) => {
    resetBoardState();
    currentGameId = data.gameId;

    playerXName = data.playerX.username;
    playerOName = data.playerO.username;

    showScreen("game-screen");

    if (data.isSpectator) {
        elements.gameStatus.textContent = "Spectateur";
        if (data.board) updateBoard(data.board);
    } else {
        elements.gameStatus.textContent = `Vs ${data.playerX.id === socket.id ? data.playerO.username : data.playerX.username}`;
    }
    updateTurn(data.currentTurn, data.currentTurn === "X" ? playerXName : playerOName);
});

socket.on("board_update", (data: any) => {
    updateBoard(data.board);
    updateTurn(data.currentTurn, data.currentTurn === "X" ? playerXName : playerOName);
});

socket.on("game_over", (data: any) => {
    if (data.winner === "DRAW") {
        showCoinToss();
    } else {
        alert(data.winner === "OPPONENT_DISCONNECTED" ? "Adversaire deconnecte !" : `Victoire: ${data.winner}`);
        if (data.winner !== "DRAW") {
            resetBoardState();
            showScreen("lobby-screen");
        }
    }
});

socket.on("coin_toss_result", (data: any) => {
    showCoinResult(data.winner.username, data.message);
});
