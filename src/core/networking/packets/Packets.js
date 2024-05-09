import PacketHeaderEnum from '../../enum/PacketHeaderEnum.js';
import HandshakePacketHandler from './handlers/HandshakePacketHandler.js';
import LoginRequestPacketHandler from './handlers/LoginRequestPacketHandler.js';
import HandshakePacket from './packet/bidirectional/HandshakePacket.js';
import LoginRequestPacket from './packet/in/LoginRequestPacket.js';

export default () =>
    new Map([
        [
            PacketHeaderEnum.HANDSHAKE,
            {
                packet: HandshakePacket,
                createHandler: (params) => new HandshakePacketHandler(params),
            },
        ],
        [
            PacketHeaderEnum.LOGIN_REQUEST,
            {
                packet: LoginRequestPacket,
                createHandler: (params) => new LoginRequestPacketHandler(params),
            },
        ],
    ]);
