import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import LoginStatusEnum from '../../../../enum/LoginStatusEnum.js';
import LoginFailedPacket from '../packet/out/LoginFailedPacket.js';
import LoginSuccessPacket from '../packet/out/LoginSuccess.js';

export default class LoginRequestPacketHandler {
    #accountRepository;
    #logger;

    constructor({ accountRepository, logger }) {
        this.#accountRepository = accountRepository;
        this.#logger = logger;
    }

    async execute(connection, packet) {
        const account = await this.#accountRepository.findByUsername(packet.username);

        if (!account) {
            this.#logger.info(`[LOGIN_REQUEST] Username not found for username ${packet.username}`);
            connection.send(
                new LoginFailedPacket({
                    status: LoginStatusEnum.LOGIN_OR_PASS_INCORRECT,
                }),
            );
            return;
        }

        const isPasswordValid = await bcrypt.compare(packet.password, account.password);

        if (!isPasswordValid) {
            this.#logger.info(`[LOGIN_REQUEST] Invalid password for username ${packet.username}`);
            connection.send(
                new LoginFailedPacket({
                    status: LoginStatusEnum.LOGIN_OR_PASS_INCORRECT,
                }),
            );
            return;
        }

        connection.send(
            new LoginSuccessPacket({
                key: randomBytes(4).readUInt32LE(),
                result: 1,
            }),
        );
    }
}
