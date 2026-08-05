import GameConnection from '@/game/interface/networking/GameConnection';

export default class SessionManager {
    private readonly connectionsByAccountId = new Map<number, GameConnection>();

    get(accountId: number) {
        return this.connectionsByAccountId.get(accountId);
    }

    set(accountId: number, connection: GameConnection) {
        this.connectionsByAccountId.set(accountId, connection);
    }

    /** Drops the entry only if it still points at this exact connection. */
    remove(connection: GameConnection) {
        const accountId = connection.getAccountId();
        if (accountId === null) return;
        if (this.connectionsByAccountId.get(accountId) !== connection) return;
        this.connectionsByAccountId.delete(accountId);
    }

    size() {
        return this.connectionsByAccountId.size;
    }
}
