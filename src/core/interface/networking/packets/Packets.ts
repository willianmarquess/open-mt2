import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import EmpirePacket from './packet/bidirectional/empire/EmpirePacket';
import EmpirePacketHandler from './packet/bidirectional/empire/EmpirePacketHandler';
import HandshakePacket from './packet/bidirectional/handshake/HandshakePacket';
import HandshakePacketHandler from './packet/bidirectional/handshake/HandshakePacketHandler';
import AttackPacket from './packet/in/attack/AttackPacket';
import AttackPacketHandler from './packet/in/attack/AttackPacketHandler';
import AuthTokenPacket from './packet/in/authToken/AuthTokenPacket';
import AuthTokenPacketHandler from './packet/in/authToken/AuthTokenPacketHandler';
import CharacterMovePacket from './packet/in/characterMove/CharacterMovePacket';
import CharacterMovePacketHandler from './packet/in/characterMove/CharacterMovePacketHandler';
import ChatInPacket from './packet/in/chat/ChatInPacket';
import ChatInPacketHandler from './packet/in/chat/ChatInPacketHandler';
import ClientVersionPacket from './packet/in/clientVersion/ClientVersionPacket';
import ClientVersionPacketHandler from './packet/in/clientVersion/ClientVersionPacketHandler';
import CreateCharacterPacket from './packet/in/createCharacter/CreateCharacterPacket';
import CreateCharacterPacketHandler from './packet/in/createCharacter/CreateCharacterPacketHandler';
import EnterGamePacket from './packet/in/enterGame/EnterGamePacket';
import EnterGamePacketHandler from './packet/in/enterGame/EnterGamePacketHandler';
import ItemDropPacket from './packet/in/itemDrop/ItemDropPacket';
import ItemDropPacketHandler from './packet/in/itemDrop/ItemDropPacketHandler';
import ItemMovePacket from './packet/in/itemMove/ItemMovePacket';
import ItemMovePacketHandler from './packet/in/itemMove/ItemMovePacketHandler';
import ItemPickupPacket from './packet/in/itemPickup/ItemPickupPacket';
import ItemPickupPacketHandler from './packet/in/itemPickup/ItemPickupPacketHandler';
import ItemUsePacket from './packet/in/itemUse/ItemUsePacket';
import ItemUsePacketHandler from './packet/in/itemUse/ItemUsePacketHandler';
import LoginRequestPacket from './packet/in/loginRequest/LoginRequestPacket';
import LoginRequestPacketHandler from './packet/in/loginRequest/LoginRequestPacketHandler';
import SelectCharacterPacket from './packet/in/selectCharacter/SelectCharacterPacket';
import SelectCharacterPacketHandler from './packet/in/selectCharacter/SelectCharacterPacketHandler';
import ServerStatusRequestPacket from './packet/in/serverStatus/ServerStatusRequestPacket';
import ServerStatusRequestPacketHandler from './packet/in/serverStatus/ServerStatusRequestPacketHandler';
import TargetPacket from './packet/in/target/TargetPacket';
import TargetPacketHandler from './packet/in/target/TargetPacketHandler';
import Packet from './packet/Packet';
import PacketHandler from './packet/PacketHandler';

export type PacketMapValue<T extends Packet> = {
    createPacket: (params?: any) => T;
    createHandler: (container: any) => PacketHandler<T>;
};

const packets: Map<number, PacketMapValue<any>> = new Map<number, PacketMapValue<any>>([
    [
        PacketHeaderEnum.HANDSHAKE,
        {
            createPacket: (params = {}) => new HandshakePacket(params),
            createHandler: (params) => new HandshakePacketHandler(params),
        },
    ],
    [
        PacketHeaderEnum.LOGIN_REQUEST,
        {
            createPacket: (params = {}) => new LoginRequestPacket(params),
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
            createPacket: (params = {}) => new AuthTokenPacket(params),
            createHandler: (params) => new AuthTokenPacketHandler(params),
        },
    ],
    [
        PacketHeaderEnum.EMPIRE,
        {
            createPacket: (params = {}) => new EmpirePacket(params),
            createHandler: (params) => new EmpirePacketHandler(params),
        },
    ],
    [
        PacketHeaderEnum.CREATE_CHARACTER,
        {
            createPacket: (params = {}) => new CreateCharacterPacket(params),
            createHandler: (params) => new CreateCharacterPacketHandler(params),
        },
    ],
    [
        PacketHeaderEnum.SELECT_CHARACTER,
        {
            createPacket: (params = {}) => new SelectCharacterPacket(params),
            createHandler: (params) => new SelectCharacterPacketHandler(params),
        },
    ],
    [
        PacketHeaderEnum.CLIENT_VERSION,
        {
            createPacket: (params = {}) => new ClientVersionPacket(params),
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
            createPacket: (params = {}) => new CharacterMovePacket(params),
            createHandler: (params) => new CharacterMovePacketHandler(params),
        },
    ],
    [
        PacketHeaderEnum.CHAT_IN,
        {
            createPacket: (params = {}) => new ChatInPacket(params),
            createHandler: (params) => new ChatInPacketHandler(params),
        },
    ],
    [
        PacketHeaderEnum.ITEM_USE,
        {
            createPacket: (params = {}) => new ItemUsePacket(params),
            createHandler: (params) => new ItemUsePacketHandler(params),
        },
    ],
    [
        PacketHeaderEnum.ITEM_MOVE,
        {
            createPacket: (params = {}) => new ItemMovePacket(params),
            createHandler: (params) => new ItemMovePacketHandler(params),
        },
    ],
    [
        PacketHeaderEnum.ITEM_DROP,
        {
            createPacket: (params = {}) => new ItemDropPacket(params),
            createHandler: (params) => new ItemDropPacketHandler(params),
        },
    ],
    [
        PacketHeaderEnum.ITEM_PICKUP,
        {
            createPacket: (params = {}) => new ItemPickupPacket(params),
            createHandler: (params) => new ItemPickupPacketHandler(params),
        },
    ],
    [
        PacketHeaderEnum.ATTACK,
        {
            createPacket: (params = {}) => new AttackPacket(params),
            createHandler: (params) => new AttackPacketHandler(params),
        },
    ],
    [
        PacketHeaderEnum.TARGET,
        {
            createPacket: (params = {}) => new TargetPacket(params),
            createHandler: (params) => new TargetPacketHandler(params),
        },
    ],
]);

export const makePackets = () => packets;
