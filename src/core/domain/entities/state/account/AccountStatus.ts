import StateEntity from '../StateEntity';

export default class AccountStatus extends StateEntity {
    private readonly clientStatus: string;
    private readonly allowLogin: boolean;
    private readonly description: number;

    constructor({ id, clientStatus, allowLogin, description, createdAt, updatedAt }) {
        super(id, createdAt, updatedAt);
        this.clientStatus = clientStatus;
        this.allowLogin = allowLogin;
        this.description = description;
    }

    getClientStatus() {
        return this.clientStatus;
    }

    getAllowLogin() {
        return this.allowLogin;
    }

    getDescription() {
        return this.description;
    }

    static create({ id, clientStatus, allowLogin, description, createdAt, updatedAt }) {
        return new AccountStatus({ id, clientStatus, allowLogin, description, createdAt, updatedAt });
    }
}
