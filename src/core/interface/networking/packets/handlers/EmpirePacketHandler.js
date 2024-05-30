export default class EmpirePacketHandler {
    #selectEmpireService;

    constructor({ selectEmpireService }) {
        this.#selectEmpireService = selectEmpireService;
    }

    async execute(connection, packet) {
        const { empireId } = packet;
        return this.#selectEmpireService.execute(connection, { empireId });
    }
}
