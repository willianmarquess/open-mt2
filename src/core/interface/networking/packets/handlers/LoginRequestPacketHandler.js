import LoginSuccessPacket from '../packet/out/LoginSuccess.js';

const LOGIN_SUCCESS_RESULT = 1;

export default class LoginRequestPacketHandler {
    #loginService;

    constructor({ loginService }) {
        this.#loginService = loginService;
    }

    async execute(connection, packet) {
        const result = await this.#loginService.execute({
            username: packet.username,
            password: packet.password,
        });

        if (result.hasError()) {
            connection.close();
            return;
        }

        const { data: key } = result;

        connection.send(
            new LoginSuccessPacket({
                key,
                result: LOGIN_SUCCESS_RESULT,
            }),
        );
    }
}
