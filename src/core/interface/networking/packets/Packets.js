import PacketHeaderEnum from '../../../enum/PacketHeaderEnum.js';
import HandshakePacketHandler from './packet/bidirectional/handshake/HandshakePacketHandler.js';
import LoginRequestPacket from './packet/in/loginRequest/LoginRequestPacket.js';
import EmpirePacket from './packet/bidirectional/empire/EmpirePacket.js';
import CreateCharacterPacket from './packet/in/createCharacter/CreateCharacterPacket.js';
import CreateCharacterPacketHandler from './packet/in/createCharacter/CreateCharacterPacketHandler.js';
import SelectCharacterPacket from './packet/in/selectCharacter/SelectCharacterPacket.js';
import ClientVersionPacket from './packet/in/clientVersion/ClientVersionPacket.js';
import ClientVersionPacketHandler from './packet/in/clientVersion/ClientVersionPacketHandler.js';
import AuthTokenPacket from './packet/in/authToken/AuthTokenPacket.js';
import AuthTokenPacketHandler from './packet/in/authToken/AuthTokenPacketHandler.js';
import CharacterMovePacket from './packet/in/characterMove/CharacterMovePacket.js';
import CharacterMovePacketHandler from './packet/in/characterMove/CharacterMovePacketHandler.js';
import ChatInPacket from './packet/in/chat/ChatInPacket.js';
import ChatInPacketHandler from './packet/in/chat/ChatInPacketHandler.js';
import LoginRequestPacketHandler from './packet/in/loginRequest/LoginRequestPacketHandler.js';
import SelectCharacterPacketHandler from './packet/in/selectCharacter/SelectCharacterPacketHandler.js';
import EnterGamePacket from './packet/in/enterGame/EnterGamePacket.js';
import EnterGamePacketHandler from './packet/in/enterGame/EnterGamePacketHandler.js';
import ServerStatusRequestPacket from './packet/in/serverStatus/ServerStatusRequestPacket.js';
import ServerStatusRequestPacketHandler from './packet/in/serverStatus/ServerStatusRequestPacketHandler.js';
import HandshakePacket from './packet/bidirectional/handshake/HandshakePacket.js';
import EmpirePacketHandler from './packet/bidirectional/empire/EmpirePacketHandler.js';
import ItemUsePacket from './packet/in/itemUse/ItemUsePacket.js';
import ItemUsePacketHandler from './packet/in/itemUse/ItemUsePacketHandler.js';
import ItemMovePacket from './packet/in/itemMove/ItemMovePacket.js';
import ItemMovePacketHandler from './packet/in/itemMove/ItemMovePacketHandler.js';
import ItemDropPacket from './packet/in/itemDrop/ItemDropPacket.js';
import ItemDropPacketHandler from './packet/in/itemDrop/ItemDropPacketHandler.js';
import ItemPickupPacket from './packet/in/itemPickup/ItemPickupPacket.js';
import ItemPickupPacketHandler from './packet/in/itemPickup/ItemPickupPacketHandler.js';

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
        [
            PacketHeaderEnum.CLIENT_VERSION,
            {
                createPacket: () => new ClientVersionPacket(),
                createHandler: (params) => new ClientVersionPacketHandler(params),
            },
        ],
        [
            PacketHeaderEnum.ENTER_GAME,
            {
                createPacket: () => new EnterGamePacket(),
                createHandler: (params) => new EnterGamePacketHandler(params),
            },
        ],
        [
            PacketHeaderEnum.CHARACTER_MOVE,
            {
                createPacket: () => new CharacterMovePacket(),
                createHandler: (params) => new CharacterMovePacketHandler(params),
            },
        ],
        [
            PacketHeaderEnum.CHAT_IN,
            {
                createPacket: () => new ChatInPacket(),
                createHandler: (params) => new ChatInPacketHandler(params),
            },
        ],
        [
            PacketHeaderEnum.ITEM_USE,
            {
                createPacket: () => new ItemUsePacket(),
                createHandler: (params) => new ItemUsePacketHandler(params),
            },
        ],
        [
            PacketHeaderEnum.ITEM_MOVE,
            {
                createPacket: () => new ItemMovePacket(),
                createHandler: (params) => new ItemMovePacketHandler(params),
            },
        ],
        [
            PacketHeaderEnum.ITEM_DROP,
            {
                createPacket: () => new ItemDropPacket(),
                createHandler: (params) => new ItemDropPacketHandler(params),
            },
        ],
        [
            PacketHeaderEnum.ITEM_PICKUP,
            {
                createPacket: () => new ItemPickupPacket(),
                createHandler: (params) => new ItemPickupPacketHandler(params),
            },
        ],
    ]);
