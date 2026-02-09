declare const io: () => {
  on: (event: string, cb: (...args: any[]) => void) => void;
  emit: (event: string, payload?: unknown) => void;
};

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

socket.on("hello", (msg: string) => {
  console.log("Message du serveur:", msg);
  messageEl.textContent = msg;
});

socket.on("disconnect", () => {
  statusEl.textContent = "Deconnecte";
});
