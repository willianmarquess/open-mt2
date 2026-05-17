import StateEntity from '@/core/domain/entities/state/StateEntity';
import AccountStatus from '@/core/domain/entities/state/account/AccountStatus';

export default class Account extends StateEntity {
    readonly username: string;
    readonly password: string;
    readonly email: string;
    readonly lastLogin: Date;
    readonly deleteCode: string;
    readonly accountStatus: AccountStatus;

    constructor({
        id,
        username,
        password,
        email,
        lastLogin,
        deleteCode,
        accountStatus,
        createdAt,
        updatedAt,
    }: {
        id: number;
        username: string;
        password: string;
        email: string;
        lastLogin: Date;
        deleteCode: string;
        accountStatus: AccountStatus;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        super(id, createdAt, updatedAt);
        this.username = username;
        this.password = password;
        this.email = email;
        this.lastLogin = lastLogin;
        this.deleteCode = deleteCode;
        this.accountStatus = accountStatus;
    }

    getUsername() {
        return this.username;
    }

    getPassword() {
        return this.password;
    }

    getEmail() {
        return this.email;
    }

    getLastLogin() {
        return this.lastLogin;
    }

    getDeleteCode() {
        return this.deleteCode;
    }

    getAccountStatus() {
        return this.accountStatus;
    }

    static create({
        id,
        username,
        password,
        email,
        lastLogin,
        deleteCode,
        createdAt,
        updatedAt,
        accountStatus,
    }: {
        id: number;
        username: string;
        password: string;
        email: string;
        lastLogin: Date;
        deleteCode: string;
        createdAt?: Date;
        updatedAt?: Date;
        accountStatus: AccountStatus;
    }) {
        return new Account({
            id,
            username,
            password,
            email,
            lastLogin,
            deleteCode,
            createdAt,
            updatedAt,
            accountStatus,
        });
    }
}
