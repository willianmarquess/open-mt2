import ErrorTypesEnum from '../../../../enum/ErrorTypesEnum.js';
import Ip from '../../../../util/Ip.js';
import CreateCharacterSucessPacket from '../packet/out/CreateCharacterSuccess.js';

/**
 * @typedef {Object} container
 * @property {Object} logger - The logger instance used for logging information.
 * @property {Object} config - The configuration object containing necessary settings.
 * @property {CreateCharacterUseCase} createCharacterUseCase - The use case instance for creating characters.
 */

export default class CreateCharacterPacketHandler {
    #logger;
    #config;
    #createCharacterUseCase;

    /**
     * Creates an instance of CreateCharacterPacketHandler.
     *
     * @param {container} dependencies - The dependencies required by the handler.
     * @param {Object} dependencies.logger - The logger instance used for logging information.
     * @param {Object} dependencies.config - The configuration object containing necessary settings.
     * @param {CreateCharacterUseCase} dependencies.createCharacterUseCase - The use case instance for creating characters.
     */
    constructor({ logger, config, createCharacterUseCase }) {
        this.#logger = logger;
        this.#config = config;
        this.#createCharacterUseCase = createCharacterUseCase;
    }

    async execute(connection, packet) {
        const { accountId } = connection;
        if (!accountId) {
            this.#logger.info(
                `[CreateCharacterPacketHandler] The connection does not have an accountId, this cannot happen`,
            );
            connection.close();
            return;
        }

        const result = await this.#createCharacterUseCase.execute({
            accountId,
            playerName: packet.name,
            playerClass: packet.clazz,
            appearance: packet.appearance,
            slot: packet.slot,
        });

        if (result.hasError()) {
            const { error } = result;

            switch (error) {
                case ErrorTypesEnum.NAME_ALREADY_EXISTS:
                    //send failure packet
                    break;
                case ErrorTypesEnum.ACCOUNT_FULL:
                case ErrorTypesEnum.EMPIRE_NOT_SELECTED:
                    connection.close();
                    break;
                default:
                    this.#logger.error(`[CreateCharacterPacketHandler] Unknown error: ${result.error}`);
                    connection.close();
                    break;
            }

            return;
        }

        const { data: player } = result;

        const createCharPacket = new CreateCharacterSucessPacket({
            slot: packet.slot,
            character: {
                name: player.name,
                clazz: player.playerClass,
                bodyPart: player.bodyPart,
                hairPart: player.hairPart,
                level: player.level,
                skillGroup: player.skillGroup,
                playTime: player.playTime,
                port: this.#config.SERVER_PORT,
                ip: Ip.toInt('127.0.0.1'),
                id: player.id,
                nameChange: 0,
                positionX: player.positionX,
                positionY: player.positionY,
                ht: player.ht,
                st: player.st,
                dx: player.dx,
                iq: player.iq,
            },
        });

        connection.send(createCharPacket);
    }
}
