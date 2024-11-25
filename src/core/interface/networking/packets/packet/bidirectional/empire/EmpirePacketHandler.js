import ErrorTypesEnum from "../../../../../../enum/ErrorTypesEnum.js";

export default class EmpirePacketHandler {
  #selectEmpireService;
  #logger;

  constructor({ selectEmpireService, logger }) {
    this.#selectEmpireService = selectEmpireService;
    this.#logger = logger;
  }

  async execute(connection, packet) {
    if (!packet.isValid()) {
      this.#logger.error(`[AuthTokenPacketHandler] Packet invalid`);
      this.#logger.error(packet.errors());
      connection.close();
      return;
    }

    const { accountId } = connection;
    if (!accountId) {
      this.#logger.info(`[EmpirePacketHandler] The connection does not have an accountId, this cannot happen`);
      connection.close();
      return;
    }

    const { empireId } = packet;
    const result = await this.#selectEmpireService.execute({ empireId, accountId });

    if (result.hasError()) {
      const { error } = result;

      if (error === ErrorTypesEnum.INVALID_EMPIRE) {
        connection.close();
        return;
      }
    }
  }
}
