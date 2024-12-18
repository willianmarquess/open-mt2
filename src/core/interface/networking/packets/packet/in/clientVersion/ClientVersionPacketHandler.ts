import Logger from '@/core/infra/logger/Logger';
import PacketHandler from '../../PacketHandler';
import ClientVersionPacket from './ClientVersionPacket';
import GameConnection from '@/game/interface/networking/GameConnection';

export default class ClientVersionPacketHandler extends PacketHandler<ClientVersionPacket> {
    private readonly logger: Logger;

    constructor({ logger }) {
        super();
        this.logger = logger;
    }

    async execute(connection: GameConnection, packet: ClientVersionPacket) {
        this.logger.info(
            `[ClientVersionPacketHandler] Client version received, id: ${connection.getId()}, clientName: ${packet.getClientName()}, timestamp: ${packet.getTimeStamp()}`,
        );
    }
}
