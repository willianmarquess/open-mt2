import Account from '@/core/domain/entities/state/account/Account';

export interface IAccountRepository {
    findByUsername(username: string): Promise<Account>;
}
