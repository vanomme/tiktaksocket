export const elements = {
    loginScreen: document.getElementById("login-screen"),
    lobbyScreen: document.getElementById("lobby-screen"),
    gameScreen: document.getElementById("game-screen"),
    usernameInput: document.getElementById("username-input"),
    loginBtn: document.getElementById("login-btn"),
    playersUl: document.getElementById("players-ul"),
    cells: document.querySelectorAll(".cell"),
    gameStatus: document.getElementById("game-status"),
    turnIndicator: document.getElementById("turn-indicator"),
    coinTossModal: document.getElementById("coin-toss-modal"),
    coinAnimation: document.getElementById("coin-animation"),
    coinResult: document.getElementById("coin-result"),
    closeModalBtn: document.getElementById("close-modal-btn"),
    currentUsername: document.getElementById("current-username"),
    challengeModal: document.getElementById("challenge-modal"),
    challengeMessage: document.getElementById("challenge-message"),
    acceptChallengeBtn: document.getElementById("accept-challenge-btn"),
    declineChallengeBtn: document.getElementById("decline-challenge-btn"),
    notificationModal: document.getElementById("notification-modal"),
    notificationTitle: document.getElementById("notification-title"),
    notificationMessage: document.getElementById("notification-message"),
    closeNotificationBtn: document.getElementById("close-notification-btn")
};
export function showScreen(id) {
    document.querySelectorAll("#app > div:not(.modal)").forEach(el => el.classList.add("hidden"));
    document.getElementById(id)?.classList.remove("hidden");
}
export function resetBoardState() {
    elements.cells.forEach(c => {
        c.textContent = "";
        c.className = "cell";
    });
    elements.gameStatus.textContent = "Start Game";
    elements.turnIndicator.textContent = "";
}
export function updateBoard(board) {
    elements.cells.forEach((c, i) => {
        const val = board[i];
        c.textContent = val || "";
        c.className = "cell " + (val ? val.toLowerCase() : "");
    });
}
export function updateTurn(turn, name) {
    elements.turnIndicator.textContent = `Tour: ${turn} (${name})`;
}
export function showCoinToss() {
    elements.gameStatus.textContent = "Egalite ! Tirage au sort...";
    elements.coinTossModal.classList.remove("hidden");
    elements.coinAnimation.innerHTML = `
        <div class="coin">
            <div class="coin-front">?</div>
            <div class="coin-back">?</div>
        </div>
    `;
    elements.coinResult.textContent = "La piece tourne...";
}
export function showCoinResult(winnerName, message) {
    elements.coinAnimation.innerHTML = `
        <div class="coin" style="animation: none; transform: rotateY(0deg);">
            <div class="coin-front" style="background-color: #27ae60;">${winnerName.charAt(0).toUpperCase()}</div>
        </div>
    `;
    elements.coinResult.textContent = message;
}
export function updatePlayerList(players, myPlayerId, onChallenge, onSpectate) {
    elements.playersUl.innerHTML = "";
    players.forEach(p => {
        if (p.id === myPlayerId)
            return;
        const li = document.createElement("li");
        const statusText = p.status === 'playing' ? ' (En jeu)' : '';
        li.textContent = p.username + statusText;
        if (p.status === 'available') {
            const btn = document.createElement("button");
            btn.textContent = "Defier";
            btn.className = "challenge-btn";
            btn.onclick = () => onChallenge(p.id);
            li.appendChild(btn);
        }
        else if (p.status === 'playing') {
            const watchBtn = document.createElement("button");
            watchBtn.textContent = "Regarder";
            watchBtn.className = "challenge-btn";
            watchBtn.style.marginLeft = "5px";
            watchBtn.style.backgroundColor = "#17a2b8";
            watchBtn.onclick = () => onSpectate(p.id);
            li.appendChild(watchBtn);
        }
        elements.playersUl.appendChild(li);
    });
}
export function showChallengeModal(username, onAccept, onDecline) {
    elements.challengeMessage.textContent = `${username} vous defie !`;
    elements.challengeModal.classList.remove("hidden");
    elements.acceptChallengeBtn.onclick = () => {
        elements.challengeModal.classList.add("hidden");
        onAccept();
    };
    elements.declineChallengeBtn.onclick = () => {
        elements.challengeModal.classList.add("hidden");
        onDecline();
    };
}
export function showNotification(title, message, onClose) {
    elements.notificationTitle.textContent = title;
    elements.notificationMessage.textContent = message;
    elements.notificationModal.classList.remove("hidden");
    elements.closeNotificationBtn.onclick = () => {
        elements.notificationModal.classList.add("hidden");
        if (onClose)
            onClose();
    };
}
