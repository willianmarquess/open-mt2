import Account from '../../domain/entities/Account.js';
import AccountStatus from '../../domain/entities/AccountStatus.js';

export default class AccountRepository {
    #databaseManager;

    constructor({ databaseManager }) {
        this.#databaseManager = databaseManager;
    }

    async findByUsername(username) {
        const [accounts] = await this.#databaseManager.connection.query(
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

        return this.#mapToEntity(accounts[0]);
    }

    #mapToEntity(account) {
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
