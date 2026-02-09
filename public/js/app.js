"use strict";
const statusEl = document.getElementById("status");
const messageEl = document.getElementById("message");
if (!statusEl || !messageEl) {
    throw new Error("Elements DOM introuvables");
}
const socket = io();
socket.on("connect", () => {
    statusEl.textContent = "Connecte";
    socket.emit("hello", "Hello World depuis le navigateur");
});
socket.on("hello", (msg) => {
    console.log("Message du serveur:", msg);
    messageEl.textContent = msg;
});
socket.on("disconnect", () => {
    statusEl.textContent = "Deconnecte";
});
