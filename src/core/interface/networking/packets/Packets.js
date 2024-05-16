import PacketHeaderEnum from '../../../enum/PacketHeaderEnum.js';
import HandshakePacketHandler from './handlers/HandshakePacketHandler.js';
import LoginRequestPacketHandler from './handlers/LoginRequestPacketHandler.js';
import ServerStatusRequestPacketHandler from './handlers/ServerStatusRequestPacketHandler.js';
import TokenPacketHandler from './handlers/TokenPacketHandler.js';
import HandshakePacket from './packet/bidirectional/HandshakePacket.js';
import LoginRequestPacket from './packet/in/LoginRequestPacket.js';
import ServerStatusRequestPacket from './packet/in/ServerStatusRequestPacket.js';
import TokenPacket from './packet/in/TokenPacket.js';

export default () =>
    new Map([
        [
            PacketHeaderEnum.HANDSHAKE,
            {
                packet: new HandshakePacket(),
                createHandler: (params) => new HandshakePacketHandler(params),
            },
        ],
        [
            PacketHeaderEnum.LOGIN_REQUEST,
            {
                packet: new LoginRequestPacket(),
                createHandler: (params) => new LoginRequestPacketHandler(params),
            },
        ],
        [
            PacketHeaderEnum.SERVER_STATUS_REQUEST,
            {
                packet: new ServerStatusRequestPacket(),
                createHandler: (params) => new ServerStatusRequestPacketHandler(params),
            },
        ],
        [
            PacketHeaderEnum.TOKEN,
            {
                packet: new TokenPacket(),
                createHandler: (params) => new TokenPacketHandler(params),
            },
        ],
    ]);
