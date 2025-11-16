import GameConnection from '@/game/interface/networking/GameConnection';
import PacketHandler from '../../PacketHandler';
import Logger from '@/core/infra/logger/Logger';
import InternalPingPacket from './InternalPingPacket';
import InternalPongPacket from '../../out/InternalPongPacket';

export default class InternalPingPacketHandler extends PacketHandler<InternalPingPacket> {
    private logger: Logger;

    constructor({ logger }) {
        super();
        this.logger = logger;
    }

    async execute(connection: GameConnection, packet: InternalPingPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[InternalPingPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }
        connection.send(new InternalPongPacket({ time: packet.getTime() }));
    }
}
