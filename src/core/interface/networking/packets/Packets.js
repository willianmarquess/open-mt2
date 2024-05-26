import PacketHeaderEnum from '../../../enum/PacketHeaderEnum.js';
import HandshakePacketHandler from './handlers/HandshakePacketHandler.js';
import LoginRequestPacketHandler from './handlers/LoginRequestPacketHandler.js';
import ServerStatusRequestPacketHandler from './handlers/ServerStatusRequestPacketHandler.js';
import AuthTokenPacketHandler from './handlers/AuthTokenPacketHandler.js';
import HandshakePacket from './packet/bidirectional/HandshakePacket.js';
import LoginRequestPacket from './packet/in/LoginRequestPacket.js';
import ServerStatusRequestPacket from './packet/in/ServerStatusRequestPacket.js';
import AuthTokenPacket from './packet/in/AuthTokenPacket.js';
import EmpirePacket from './packet/bidirectional/EmpirePacket.js';
import EmpirePacketHandler from './handlers/EmpirePacketHandler.js';
import CreateCharacterPacket from './packet/in/CreateCharacterPacket.js';
import CreateCharacterPacketHandler from './handlers/CreateCharacterPacketHandler.js';
import SelectCharacterPacket from './packet/in/SelectCharacterPacket.js';
import SelectCharacterPacketHandler from './handlers/SelectCharacterPacketHandler.js';

export default () =>
    new Map([
        [
            PacketHeaderEnum.HANDSHAKE,
            {
                createPacket: () => new HandshakePacket(),
                createHandler: (params) => new HandshakePacketHandler(params),
            },
        ],
        [
            PacketHeaderEnum.LOGIN_REQUEST,
            {
                createPacket: () => new LoginRequestPacket(),
                createHandler: (params) => new LoginRequestPacketHandler(params),
            },
        ],
        [
            PacketHeaderEnum.SERVER_STATUS_REQUEST,
            {
                createPacket: () => new ServerStatusRequestPacket(),
                createHandler: (params) => new ServerStatusRequestPacketHandler(params),
            },
        ],
        [
            PacketHeaderEnum.TOKEN,
            {
                createPacket: () => new AuthTokenPacket(),
                createHandler: (params) => new AuthTokenPacketHandler(params),
            },
        ],
        [
            PacketHeaderEnum.EMPIRE,
            {
                createPacket: () => new EmpirePacket(),
                createHandler: (params) => new EmpirePacketHandler(params),
            },
        ],
        [
            PacketHeaderEnum.CREATE_CHARACTER,
            {
                createPacket: () => new CreateCharacterPacket(),
                createHandler: (params) => new CreateCharacterPacketHandler(params),
            },
        ],
        [
            PacketHeaderEnum.SELECT_CHARACTER,
            {
                createPacket: () => new SelectCharacterPacket(),
                createHandler: (params) => new SelectCharacterPacketHandler(params),
            },
        ],
    ]);
