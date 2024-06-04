import ErrorTypesEnum from '../../../../enum/ErrorTypesEnum';

export default class EmpirePacketHandler {
    #selectEmpireService;
    #logger;

    constructor({ selectEmpireService, logger }) {
        this.#selectEmpireService = selectEmpireService;
        this.#logger = logger;
    }

    async execute(connection, packet) {
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
