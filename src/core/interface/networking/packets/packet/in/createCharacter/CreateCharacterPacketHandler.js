import CreateCharacterFailureReasonEnum from "../../../../../../enum/CreateCharacterFailureReasonEnum.js";
import ErrorTypesEnum from "../../../../../../enum/ErrorTypesEnum.js";
import Ip from "../../../../../../util/Ip.js";
import CreateCharacterFailurePacket from "../../out/CreateCharacterFailurePacket.js";
import CreateCharacterSuccessPacket from "../../out/CreateCharacterSuccessPacket.js";
/**
 * @typedef {Object} container
 * @property {CreateCharacterService} createCharacterService - The use case instance for creating characters.
 */

export default class CreateCharacterPacketHandler {
  #createCharacterService;
  #logger;
  #config;

  /**
   * Creates an instance of CreateCharacterPacketHandler.
   *
   * @param {container} dependencies - The dependencies required by the handler.
   * @param {createCharacterService} dependencies.createCharacterService - The use case instance for creating characters.
   */
  constructor({ createCharacterService, logger, config }) {
    this.#createCharacterService = createCharacterService;
    this.#logger = logger;
    this.#config = config;
  }

  async execute(connection, packet) {
    if (!packet.isValid()) {
      this.#logger.error(`[CreateCharacterPacketHandler] Packet invalid`);
      this.#logger.error(packet.errors());
      connection.close();
      return;
    }

    const { accountId } = connection;
    if (!accountId) {
      this.#logger.info(`[CreateCharacterPacketHandler] The connection does not have an accountId, this cannot happen`);
      connection.close();
      return;
    }
    const { playerName, playerClass, appearance, slot } = packet;
    const result = await this.#createCharacterService.execute({
      playerName,
      playerClass,
      appearance,
      slot,
      accountId,
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
          this.#logger.info(`[CreateCharacterPacketHandler] Invalid error: ${error}`);
          break;
      }
      return;
    }

    const { data: player } = result;

    connection.send(
      new CreateCharacterSuccessPacket({
        slot,
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
      }),
    );
  }
}
