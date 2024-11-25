import StateEntity from "../StateEntity.js";

export default class AccountStatus extends StateEntity {
  #clientStatus;
  #allowLogin;
  #description;

  constructor({ id, clientStatus, allowLogin, description, createdAt, updatedAt }) {
    super({
      id,
      createdAt,
      updatedAt,
    });
    this.#clientStatus = clientStatus;
    this.#allowLogin = allowLogin;
    this.#description = description;
  }

  get clientStatus() {
    return this.#clientStatus;
  }

  get allowLogin() {
    return this.#allowLogin;
  }

  get description() {
    return this.#description;
  }

  static create({ id, clientStatus, allowLogin, description, createdAt, updatedAt }) {
    return new AccountStatus({ id, clientStatus, allowLogin, description, createdAt, updatedAt });
  }
}
