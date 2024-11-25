import { FieldPacket, QueryResult } from 'mysql2';
import Account from '../../../core/domain/entities/state/account/Account.js';
import AccountStatus from '../../../core/domain/entities/state/account/AccountStatus.js';
import DatabaseManager from '../../../core/infra/database/DatabaseManager.js';

export default class AccountRepository {
    constructor(private readonly databaseManager: DatabaseManager) {}

    async findByUsername(username: string): Promise<Account | null> {
        const result: [QueryResult, FieldPacket[]] = await this.databaseManager.getConnection().query(
        `
        SELECT
            account.*,
            account_status.createdAt as accountStatusCreatedAt,
            account_status.updatedAt as accountStatusUpdatedAt,
            account_status.id as accountStatusId,
            account_status.allowLogin,
            account_status.description,
            account_status.clientStatus
        FROM account
            JOIN account_status ON account.accountStatusId = account_status.id
        WHERE
            account.username = ?;
            `,
            [username],
        );
        return this.mapToEntity(result[0] as Account);
    }

    private mapToEntity(account: Account) {
        if (!account) return;
        const {
            id,
            username,
            password,
            email,
            lastLogin,
            deleteCode,
            createdAt,
            updatedAt,
            accountStatusCreatedAt,
            accountStatusUpdatedAt,
            accountStatusId,
            allowLogin,
            description,
            clientStatus,
        } = account;
        return Account(
            id,
            username,
            password,
            email,
            lastLogin,
            deleteCode,
            createdAt,
            updatedAt,
            accountStatus: AccountStatus.create({
                id: accountStatusId,
                createdAt: accountStatusCreatedAt,
                updatedAt: accountStatusUpdatedAt,
                allowLogin,
                description,
                clientStatus,
            }),
        );
    }
}
