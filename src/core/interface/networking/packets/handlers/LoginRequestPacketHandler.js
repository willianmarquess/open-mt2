import ErrorTypesEnum from '../../../../enum/ErrorTypesEnum.js';
import LoginStatusEnum from '../../../../enum/LoginStatusEnum.js';
import LoginFailedPacket from '../packet/out/LoginFailedPacket.js';
import LoginSuccessPacket from '../packet/out/LoginSuccess.js';

const LOGIN_SUCCESS_RESULT = 1;

export default class LoginRequestPacketHandler {
    #loginService;
    #logger;

    constructor({ loginService, logger }) {
        this.#loginService = loginService;
        this.#logger = logger;
    }

    async execute(connection, packet) {
        const { username, password } = packet;

        const result = await this.#loginService.execute({
            username,
            password,
        });

        if (result.hasError()) {
            const { error } = result;

            switch (error) {
                case ErrorTypesEnum.INVALID_USERNAME:
                case ErrorTypesEnum.INVALID_PASSWORD:
                    connection.send(
                        new LoginFailedPacket({
                            status: LoginStatusEnum.LOGIN_OR_PASS_INCORRECT,
                        }),
                    );
                    break;

                default:
                    this.#logger.info(`[LoginRequestPacketHandler] Invalid error: ${error}`);
                    break;
            }
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
