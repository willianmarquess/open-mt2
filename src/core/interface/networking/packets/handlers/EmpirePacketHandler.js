export default class EmpirePacketHandler {
    #logger;
    #selectEmpireUseCase;

    constructor({ logger, selectEmpireUseCase }) {
        this.#logger = logger;
        this.#selectEmpireUseCase = selectEmpireUseCase;
    }

    async execute(connection, packet) {
        if (!connection.accountId) {
            this.#logger.info(`[EmpirePacketHandler] The connection does not have an accountId, this cannot happen`);
            connection.close();
            return;
        }
        const { empireId } = packet;

        const result = await this.#selectEmpireUseCase.execute(empireId);

        if (result.hasError()) {
            connection.close();
            return;
        }
    }
}
