export default class LoginRequestPacketHandler {
    #loginService;

    constructor({ loginService }) {
        this.#loginService = loginService;
    }

    async execute(connection, packet) {
        const { username, password } = packet;
        return this.#loginService.execute(connection, {
            username,
            password,
        });
    }
}
