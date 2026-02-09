export type Player = {
    id: string;
    username: string;
    symbol: "X" | "O";
};

export class Game {
    id: string;
    playerX: Player;
    playerO: Player;
    board: (string | null)[]; // 9 cells
    currentTurn: "X" | "O";
    winner: "X" | "O" | "DRAW" | null;

    constructor(id: string, player1: { id: string, username: string }, player2: { id: string, username: string }) {
        this.id = id;
        this.playerX = { ...player1, symbol: "X" };
        this.playerO = { ...player2, symbol: "O" };
        this.board = Array(9).fill(null);
        this.currentTurn = "X";
        this.winner = null;
    }

    makeMove(index: number, playerId: string): boolean {
        // Basic validation
        if (this.winner) return false;
        if (index < 0 || index > 8) return false;
        if (this.board[index]) return false;

        // Turn validation
        const symbol = this.playerX.id === playerId ? "X" : this.playerO.id === playerId ? "O" : null;
        if (!symbol || symbol !== this.currentTurn) return false;

        // Execute move
        this.board[index] = symbol;
        this.checkWin();

        // Switch turn if game continues
        if (!this.winner) {
            this.currentTurn = this.currentTurn === "X" ? "O" : "X";
        }

        return true;
    }

    private checkWin() {
        const wins = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const [a, b, c] of wins) {
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winner = this.board[a] as "X" | "O";
                return;
            }
        }

        if (!this.board.includes(null)) {
            this.winner = "DRAW";
        }
    }
}
