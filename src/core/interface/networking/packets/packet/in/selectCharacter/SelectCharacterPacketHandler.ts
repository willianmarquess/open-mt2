import SelectCharacterService from '@/game/app/service/SelectCharacterService';
import PacketHandler from '../../PacketHandler';
import SelectCharacterPacket from './SelectCharacterPacket';
import Logger from '@/core/infra/logger/Logger';
import GameConnection from '@/game/interface/networking/GameConnection';
import { ConnectionStateEnum } from '@/core/enum/ConnectionStateEnum';

export default class SelectCharacterPacketHandler extends PacketHandler<SelectCharacterPacket> {
    private readonly selectCharacterService: SelectCharacterService;
    private readonly logger: Logger;

    constructor({ selectCharacterService, logger }) {
        super();
        this.selectCharacterService = selectCharacterService;
        this.logger = logger;
    }

    async execute(connection: GameConnection, packet: SelectCharacterPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[SelectCharacterPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const accountId = connection.getAccountId();

        if (!accountId) {
            this.logger.info(
                `[SelectCharacterPacketHandler] The connection does not have an accountId, this cannot happen`,
            );
            connection.close();
            return;
        }

        connection.setState(ConnectionStateEnum.LOADING);

        const slot = packet.getSlot();
        const result = await this.selectCharacterService.execute(slot, accountId, connection);

        if (result.hasError()) {
            connection.close();
            return;
        }
    }
}
