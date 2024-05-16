import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import LoginStatusEnum from '../../../../enum/LoginStatusEnum.js';
import LoginFailedPacket from '../packet/out/LoginFailedPacket.js';
import LoginSuccessPacket from '../packet/out/LoginSuccess.js';

const TOKEN_EXPIRATION_SECS = 60;
const LOGIN_SUCCESS_RESULT = 1;

export default class LoginRequestPacketHandler {
    #accountRepository;
    #logger;
    #cacheProvider;

    constructor({ accountRepository, logger, cacheProvider }) {
        this.#accountRepository = accountRepository;
        this.#logger = logger;
        this.#cacheProvider = cacheProvider;
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

        const key = randomBytes(4).readUInt32LE();

        await this.#cacheProvider.set(
            `token:${key}`,
            JSON.stringify({
                username: packet.username,
                accouuntId: account.id,
            }),
            TOKEN_EXPIRATION_SECS,
        );

        connection.send(
            new LoginSuccessPacket({
                key,
                result: LOGIN_SUCCESS_RESULT,
            }),
        );
    }
}
