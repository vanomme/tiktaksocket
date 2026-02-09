import { Game } from "./game";

export class GameManager {
    games: Map<string, Game>;
    players: Map<string, { id: string; username: string }>;
    playerGameMap: Map<string, string>;

    constructor() {
        this.games = new Map();
        this.players = new Map();
        this.playerGameMap = new Map();
    }

    addPlayer(id: string, username: string) {
        this.players.set(id, { id, username });
    }

    removePlayer(id: string) { // returns gameId if player was in a game
        this.players.delete(id);
        const gameId = this.playerGameMap.get(id);
        if (gameId) {
            this.games.delete(gameId);
            this.playerGameMap.delete(id); // Only removing this player's mapping, handled in server logic for opponent
            return gameId;
        }
        return null;
    }

    createGame(player1Id: string, player2Id: string): Game | null {
        const p1 = this.players.get(player1Id);
        const p2 = this.players.get(player2Id);

        if (!p1 || !p2) return null;

        const gameId = `game-${Date.now()}`;
        // Fix: We don't need to manually add symbol here if the Game constructor handles it
        // But Game constructor expects Player objects which have symbol property...
        // Wait, Game definition in V2:
        // constructor(id: string, player1: Player, player2: Player)
        // p1 and p2 in GameManager are just {id, username}.
        // We need to cast them or let Game handle the symbol assignment?
        // Game constructor does: this.playerX = { ...player1, symbol: "X" };
        // So p1 needs to be compatible with Omit<Player, 'symbol'>?
        // Let's just pass p1 and p2 as they are, and let Game class handle the symbol addition internally.
        // The error likely came from my previous implementation trying to add symbol here.

        // Actually, looking at the previous file content I wrote:
        /*
        const game = new Game(
          gameId, 
          { ...p1, symbol: "X" }, 
          { ...p2, symbol: "O" }
        );
        */
        // The error "symbol is declared but..." suggests I might have valid TS now.
        // Let's look at the error again: "symbol is declared but its value is never read."

        // In Game.ts:
        // constructor(id: string, player1: Player, player2: Player)
        // Player has symbol: "X" | "O".
        // atomic p1 is {id, username}. 
        // So I DO need to add symbol before passing to Game if Game expects Player.

        // Let's cast p1/p2 to Player (which has symbol) OR change Game constructor to take {id, username}.

        // Changing Game constructor is cleaner.

        const game = new Game(gameId, p1, p2);

        this.games.set(gameId, game);
        this.playerGameMap.set(player1Id, gameId);
        this.playerGameMap.set(player2Id, gameId);

        return game;
    }

    getGame(gameId: string) {
        return this.games.get(gameId);
    }

    getGameByPlayer(playerId: string) {
        const gameId = this.playerGameMap.get(playerId);
        if (!gameId) return null;
        return this.games.get(gameId);
    }

    getAllPlayersWithStatus() {
        const playersList: { id: string, username: string, status: 'available' | 'playing' }[] = [];
        this.players.forEach(p => {
            const isPlaying = this.playerGameMap.has(p.id);
            playersList.push({
                ...p,
                status: isPlaying ? 'playing' : 'available'
            });
        });
        return playersList;
    }
}
