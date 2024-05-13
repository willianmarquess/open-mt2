import Entity from '../../../core/domain/entities/Entity.js';

export default class Account extends Entity {
    #username;
    #password;
    #email;
    #lastLogin;
    #deleteCode;
    #accountStatus;

    constructor({ id, username, password, email, lastLogin, deleteCode, accountStatus, createdAt, updatedAt }) {
        super({
            id,
            createdAt,
            updatedAt,
        });
        this.#username = username;
        this.#password = password;
        this.#email = email;
        this.#lastLogin = lastLogin;
        this.#deleteCode = deleteCode;
        this.#accountStatus = accountStatus;
    }

    get username() {
        return this.#username;
    }

    get password() {
        return this.#password;
    }

    get email() {
        return this.#email;
    }

    get lastLogin() {
        return this.#lastLogin;
    }

    get deleteCode() {
        return this.#deleteCode;
    }

    get accountStatus() {
        return this.#accountStatus;
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
