import Logger from "@/core/infra/logger/Logger";
import SelectEmpireService from "@/game/app/service/SelectEmpireService";
import GameConnection from "@/game/interface/networking/GameConnection";
import PacketHandler from "../../PacketHandler";
import EmpirePacket from "./EmpirePacket";
import { ErrorTypesEnum } from "@/core/enum/ErrorTypesEnum";

export default class EmpirePacketHandler extends PacketHandler<EmpirePacket> {
    private readonly selectEmpireService: SelectEmpireService;
    private readonly logger: Logger;

    constructor({ selectEmpireService, logger }) {
        super();
        this.selectEmpireService = selectEmpireService;
        this.logger = logger;
    }

    async execute(connection: GameConnection, packet:EmpirePacket) {
        if (!packet.isValid()) {
            this.logger.error(`[AuthTokenPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const accountId = connection.getAccountId();

        if (!accountId) {
            this.logger.info(`[EmpirePacketHandler] The connection does not have an accountId, this cannot happen`);
            connection.close();
            return;
        }

        const empireId = packet.getEmpireId();
        const result = await this.selectEmpireService.execute(empireId, accountId);

        if (result.hasError()) {
            const error = result.getError();

            if (error === ErrorTypesEnum.INVALID_EMPIRE) {
                connection.close();
                return;
            }
        }
    }
}
