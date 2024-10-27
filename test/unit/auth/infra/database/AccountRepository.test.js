import { expect } from 'chai';
import sinon from 'sinon';
import AccountRepository from '../../../../../src/auth/infra/database/AccountRepository.js';
import Account from '../../../../../src/core/domain/entities/state/account/Account.js';
import AccountStatus from '../../../../../src/core/domain/entities/state/account/AccountStatus.js';

describe('AccountRepository', () => {
    let accountRepository;
    let databaseManagerMock;

    beforeEach(() => {
        databaseManagerMock = {
            connection: {
                query: sinon.stub(),
            },
        };
        accountRepository = new AccountRepository({ databaseManager: databaseManagerMock });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('findByUsername', () => {
        it('should return account correctly', async () => {
            const mockAccountData = [
                {
                    id: 1,
                    username: 'testuser',
                    password: 'hashedpassword',
                    email: 'testuser@example.com',
                    lastLogin: new Date(),
                    deleteCode: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    accountStatusCreatedAt: new Date(),
                    accountStatusUpdatedAt: new Date(),
                    accountStatusId: 1,
                    allowLogin: true,
                    description: 'Active',
                    clientStatus: 'ACTIVE',
                },
            ];

            databaseManagerMock.connection.query.resolves([mockAccountData]);

            const result = await accountRepository.findByUsername('testuser');

            expect(result).to.be.an.instanceOf(Account);
            expect(result).to.have.property('username', 'testuser');
            expect(result).to.have.property('email', 'testuser@example.com');
            expect(result.accountStatus).to.be.an.instanceOf(AccountStatus);
            expect(result.accountStatus).to.have.property('description', 'Active');
        });

        it('should return undefined if account not found', async () => {
            databaseManagerMock.connection.query.resolves([[]]);

            const result = await accountRepository.findByUsername('nonexistentuser');
            expect(result).to.be.undefined;
        });
    });
});
