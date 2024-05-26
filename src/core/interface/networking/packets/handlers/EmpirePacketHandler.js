export default class EmpirePacketHandler {
    #logger;
    #selectEmpireService;

    constructor({ logger, selectEmpireService }) {
        this.#logger = logger;
        this.#selectEmpireService = selectEmpireService;
    }

    async execute(connection, packet) {
        if (!connection.accountId) {
            this.#logger.info(`[EmpirePacketHandler] The connection does not have an accountId, this cannot happen`);
            connection.close();
            return;
        }
        const { empireId } = packet;

        const result = await this.#selectEmpireService.execute({ empireId, accountId: connection.accountId });

        if (result.hasError()) {
            connection.close();
            return;
        }
    }
}
