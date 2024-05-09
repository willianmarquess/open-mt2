import PacketHeader from '../../enum/PacketHeader.js';
import ConnectionStatePacket from './ConnectionStatePacket.js';
import HandshakePacket from './HandshakePacket.js';

export default () =>
    new Map([
        [PacketHeader.CONNECTION_STATE, ConnectionStatePacket],
        [PacketHeader.HANDSHAKE, HandshakePacket],
    ]);
