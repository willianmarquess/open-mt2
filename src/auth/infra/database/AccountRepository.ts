import DatabaseManager from '@/core/infra/database/DatabaseManager';
import Account from '../../../core/domain/entities/state/account/Account';
import AccountStatus from '../../../core/domain/entities/state/account/AccountStatus';
import { IAccountRepository } from '@/core/domain/repository/IAccountRepository';
import { RowDataPacket } from 'mysql2';

type AccountRow = RowDataPacket & Account;

export default class AccountRepository implements IAccountRepository {
    private readonly databaseManager: DatabaseManager;

    constructor({ databaseManager }: { databaseManager: DatabaseManager }) {
        this.databaseManager = databaseManager;
    }

    async findByUsername(username: string): Promise<Account | null> {
        const [accounts] = await this.databaseManager.getConnection().query<AccountRow[]>(
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

        return this.mapToEntity(accounts[0]);
    }

    mapToEntity(account: AccountRow | undefined): Account | null {
        if (!account) return null;
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
        return Account.create({
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
        });
    }
}
