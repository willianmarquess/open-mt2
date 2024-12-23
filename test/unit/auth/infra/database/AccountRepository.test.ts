import AccountRepository from '@/auth/infra/database/AccountRepository';
import Account from '@/core/domain/entities/state/account/Account';
import AccountStatus from '@/core/domain/entities/state/account/AccountStatus';
import { expect } from 'chai';
import sinon from 'sinon';

describe('AccountRepository', () => {
    let accountRepository: AccountRepository;
    let databaseManagerMock = {};

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

            databaseManagerMock = {
                getConnection: sinon.stub().returns({
                    query: sinon.stub().resolves([mockAccountData]),
                }),
            };

            accountRepository = new AccountRepository({ databaseManager: databaseManagerMock });

            const result = await accountRepository.findByUsername('testuser');

            expect(result).to.be.an.instanceOf(Account);
            expect(result).to.have.property('username', 'testuser');
            expect(result).to.have.property('email', 'testuser@example.com');
            expect(result.getAccountStatus()).to.be.an.instanceOf(AccountStatus);
            expect(result.getAccountStatus()).to.have.property('description', 'Active');
        });

        it('should return undefined if account not found', async () => {
            databaseManagerMock = {
                getConnection: sinon.stub().returns({
                    query: sinon.stub().resolves([[]]),
                }),
            };

            accountRepository = new AccountRepository({ databaseManager: databaseManagerMock });

            const result = await accountRepository.findByUsername('nonexistentuser');
            expect(result).to.be.undefined;
        });
    });
});
