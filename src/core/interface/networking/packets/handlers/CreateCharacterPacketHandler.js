import CreateCharacterFailureReasonEnum from '../../../../enum/CreateCharacterFailureReasonEnum.js';
import ErrorTypesEnum from '../../../../enum/ErrorTypesEnum.js';
import Ip from '../../../../util/Ip.js';
import CreateCharacterFailurePacket from '../packet/out/CreateCharacterFailurePacket.js';
import CreateCharacterSuccessPacket from '../packet/out/CreateCharacterSuccessPacket.js';

/**
 * @typedef {Object} container
 * @property {Object} logger - The logger instance used for logging information.
 * @property {Object} config - The configuration object containing necessary settings.
 * @property {CreateCharacterService} createCharacterService - The use case instance for creating characters.
 */

export default class CreateCharacterPacketHandler {
    #logger;
    #config;
    #createCharacterService;

    /**
     * Creates an instance of CreateCharacterPacketHandler.
     *
     * @param {container} dependencies - The dependencies required by the handler.
     * @param {Object} dependencies.logger - The logger instance used for logging information.
     * @param {Object} dependencies.config - The configuration object containing necessary settings.
     * @param {createCharacterService} dependencies.createCharacterService - The use case instance for creating characters.
     */
    constructor({ logger, config, createCharacterService }) {
        this.#logger = logger;
        this.#config = config;
        this.#createCharacterService = createCharacterService;
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

        const result = await this.#createCharacterService.execute({
            accountId,
            playerName: packet.playerName,
            playerClass: packet.playerClass,
            appearance: packet.appearance,
            slot: packet.slot,
        });

        if (result.hasError()) {
            const { error } = result;

            switch (error) {
                case ErrorTypesEnum.NAME_ALREADY_EXISTS:
                    connection.send(
                        new CreateCharacterFailurePacket({
                            reason: CreateCharacterFailureReasonEnum.NAME_ALREADY_EXISTS,
                        }),
                    );
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

        const createCharPacket = new CreateCharacterSuccessPacket({
            slot: packet.slot,
            character: {
                name: player.name,
                playerClass: player.playerClass,
                bodyPart: player.bodyPart,
                hairPart: player.hairPart,
                level: player.level,
                skillGroup: player.skillGroup,
                playTime: player.playTime,
                port: this.#config.SERVER_PORT,
                ip: Ip.toInt(this.#config.SERVER_ADDRESS),
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
