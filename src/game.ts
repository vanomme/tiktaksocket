export type Player = {
    id: string;
    username: string;
    symbol: "X" | "O";
};

export class Game {
    id: string;
    playerX: Player;
    playerO: Player;
    board: (string | null)[]; // 9 cells, null = empty
    currentTurn: "X" | "O";
    winner: "X" | "O" | "DRAW" | null;

    constructor(id: string, player1: Player, player2: Player) {
        this.id = id;
        // Randomize who starts or gets X/O? For now player1 is X
        this.playerX = { ...player1, symbol: "X" };
        this.playerO = { ...player2, symbol: "O" };
        this.board = Array(9).fill(null);
        this.currentTurn = "X";
        this.winner = null;
    }

    makeMove(index: number, playerId: string): boolean {
        if (this.winner) return false;
        if (index < 0 || index > 8) return false;
        if (this.board[index]) return false;

        const player = this.playerX.id === playerId ? "X" : this.playerO.id === playerId ? "O" : null;
        if (!player || player !== this.currentTurn) return false;

        this.board[index] = player;
        this.checkWin();

        if (!this.winner) {
            this.currentTurn = this.currentTurn === "X" ? "O" : "X";
        }

        return true;
    }

    private checkWin() {
        const wins = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
            [0, 4, 8], [2, 4, 6]             // Diagonals
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

    resolveDraw(coinTossWinnerId: string) {
        if (this.winner === 'DRAW') {
            const tossWinner = this.playerX.id === coinTossWinnerId ? 'X' : 'O';
            // We don't change the game winner state to X or O, because it WAS a draw. 
            // But we might want to store who won the toss?
            // For now, let's just leave it as DRAW and the server handles the event.
        }
    }
}
