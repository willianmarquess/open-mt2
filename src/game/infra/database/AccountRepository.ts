import DatabaseManager from '@/core/infra/database/DatabaseManager';
import { RowDataPacket } from 'mysql2';

type DeleteCodeRow = RowDataPacket & { deleteCode: string };

/**
 * Minimal game-side account repository: the game server only needs the
 * account's delete code to authorize character deletion.
 */
export default class AccountRepository {
    private readonly databaseManager: DatabaseManager;

    constructor({ databaseManager }: { databaseManager: DatabaseManager }) {
        this.databaseManager = databaseManager;
    }

    async getDeleteCodeById(accountId: number): Promise<string | null> {
        const [accounts] = await this.databaseManager
            .getConnection()
            .query<DeleteCodeRow[]>(`SELECT deleteCode FROM auth.account WHERE id = ?;`, [accountId]);

        if (accounts.length === 0) {
            return null;
        }

        return accounts[0].deleteCode;
    }
}
