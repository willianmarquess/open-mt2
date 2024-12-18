import StateEntity from '@/core/domain/entities/state/StateEntity';
import AccountStatus from '@/core/domain/entities/state/account/AccountStatus';

export default class Account extends StateEntity {
    private username: string;
    private password: string;
    private email: string;
    private lastLogin: Date;
    private deleteCode: string;
    private accountStatus: AccountStatus;

    constructor({ id, username, password, email, lastLogin, deleteCode, accountStatus, createdAt, updatedAt }) {
        super({
            id,
            createdAt,
            updatedAt,
        });
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

    static create({ id, username, password, email, lastLogin, deleteCode, createdAt, updatedAt, accountStatus }) {
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
