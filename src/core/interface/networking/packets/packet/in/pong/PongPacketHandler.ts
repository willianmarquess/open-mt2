import Connection from '@/core/interface/networking/Connection';
import PacketHandler from '../../PacketHandler';
import PongPacket from './PongPacket';

export default class PongPacketHandler extends PacketHandler<PongPacket> {
    async execute(connection: Connection) {
        connection.onPongReceived();
    }
}
