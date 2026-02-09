import { Game, Player } from "./game";

export class GameManager {
    games: Map<string, Game>;
    players: Map<string, { id: string; username: string }>;

    // Track which game a player is in
    playerGameMap: Map<string, string>;

    constructor() {
        this.games = new Map();
        this.players = new Map();
        this.playerGameMap = new Map();
    }

    addPlayer(id: string, username: string) {
        this.players.set(id, { id, username });
    }

    removePlayer(id: string) {
        this.players.delete(id);
        const gameId = this.playerGameMap.get(id);
        if (gameId) {
            this.games.delete(gameId); // End game if player leaves?
            this.playerGameMap.delete(id);
            return gameId;
        }
        return null;
    }

    createGame(player1Id: string, player2Id: string): Game | null {
        const p1 = this.players.get(player1Id);
        const p2 = this.players.get(player2Id);

        if (!p1 || !p2) return null;

        const gameId = `game-${Date.now()}`;
        // Casting to Player type with generic symbol for now, constructor sets specific symbols
        const game = new Game(
            gameId,
            { ...p1, symbol: "X" },
            { ...p2, symbol: "O" }
        );

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

    getAvailablePlayers(currentPlayerId: string) {
        const available: { id: string, username: string }[] = [];
        this.players.forEach(p => {
            if (p.id !== currentPlayerId && !this.playerGameMap.has(p.id)) {
                available.push(p);
            }
        });
        return available;
    }
}
