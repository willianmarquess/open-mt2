import ConnectionStateEnum from '../../../../enum/ConnectionStateEnum.js';
import ErrorTypesEnum from '../../../../enum/ErrorTypesEnum.js';

export default class AuthTokenPacketHandler {
    #logger;
    #authenticateUseCase;

    constructor({ logger, authenticateUseCase }) {
        this.#logger = logger;
        this.#authenticateUseCase = authenticateUseCase;
    }

    async execute(connection, packet) {
        const result = await this.#authenticateUseCase.execute({
            key: packet.key,
            username: packet.username,
        });

        if (result.hasError()) {
            const { error } = result;

            switch (error) {
                case ErrorTypesEnum.INVALID_TOKEN:
                    connection.close();
                    break;
                default:
                    this.#logger.error(`[AuthTokenPacketHandler] Unknown error: ${result.error}`);
                    connection.close();
                    break;
            }

            return;
        }

        //we should get this from cache or db
        // const empireIdKey = CacheKeyGenerator.createEmpireKey(token.accountId);
        // const empireIdExists = await this.#cacheProvider.exists(empireIdKey);

        // if(empireIdExists) {
        //     const empireId = await this.#cacheProvider.get(empireIdKey);
        //     connection.send(new EmpirePacket({
        //         empireId
        //     }));
        // }

        //TODO: we need to validate if already exists chars for this username

        const { data: token } = result;
        connection.accountId = token.accountId;
        connection.state = ConnectionStateEnum.SELECT;
    }
}
