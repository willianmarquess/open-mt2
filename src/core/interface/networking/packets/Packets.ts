import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import { ConnectionStateEnum } from '@/core/enum/ConnectionStateEnum';
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
import InternalPingPacket from './packet/in/internalPing/InternalPingPacket';
import InternalPingPacketHandler from './packet/in/internalPing/InternalPingPacketHandler';
import PongPacket from './packet/in/pong/PongPacket';
import PongPacketHandler from './packet/in/pong/PongPacketHandler';
import DeleteCharacterPacket from './packet/in/deleteCharacter/DeleteCharacterPacket';
import DeleteCharacterPacketHandler from './packet/in/deleteCharacter/DeleteCharacterPacketHandler';
import OnClickPacket from './packet/in/onclick/OnClickPacket';
import OnClickPacketHandler from './packet/in/onclick/OnClickPacketHandler';
import QuestAnswerPacket from './packet/in/questAnswer/QuestAnswerPacket';
import QuestAnswerPacketHandler from './packet/in/questAnswer/QuestAnswerPacketHandler';
import QuestButtonPacket from './packet/in/questButton/QuestButtonPacket';
import QuestButtonPacketHandler from './packet/in/questButton/QuestButtonPacketHandler';
import ShopPacket from './packet/in/shop/ShopPacket';
import ShopPacketHandler from './packet/in/shop/ShopPacketHandler';
import MyShopPacket from './packet/in/myshop/MyShopPacket';
import MyShopPacketHandler from './packet/in/myshop/MyShopPacketHandler';
import QuickSlotAddRequestPacket from './packet/in/quickSlotAdd/QuickSlotAddRequestPacket';
import QuickSlotAddRequestPacketHandler from './packet/in/quickSlotAdd/QuickSlotAddRequestPacketHandler';
import QuickSlotSwapRequestPacket from './packet/in/quickSlotSwap/QuickSlotSwapRequestPacket';
import QuickSlotSwapRequestPacketHandler from './packet/in/quickSlotSwap/QuickSlotSwapRequestPacketHandler';
import QuickSlotRemoveRequestPacket from './packet/in/quickSlotRemove/QuickSlotRemoveRequestPacket';
import QuickSlotRemoveRequestPacketHandler from './packet/in/quickSlotRemove/QuickSlotRemoveRequestPacketHandler';

const LOGIN_PHASES: ReadonlySet<ConnectionStateEnum> = new Set([
    ConnectionStateEnum.HANDSHAKE,
    ConnectionStateEnum.AUTH,
    ConnectionStateEnum.LOGIN,
    ConnectionStateEnum.SELECT,
    ConnectionStateEnum.LOADING,
]);

const GAME_PHASES: ReadonlySet<ConnectionStateEnum> = new Set([ConnectionStateEnum.GAME, ConnectionStateEnum.DEAD]);

const EVERY_PHASE: ReadonlySet<ConnectionStateEnum> = new Set([...LOGIN_PHASES, ...GAME_PHASES]);

export type PacketMapValue<T extends Packet> = {
    createPacket: (params?: any) => T;
    createHandler: (container: any) => PacketHandler<T>;
    phases: ReadonlySet<ConnectionStateEnum>;
};

const packets: Map<number, PacketMapValue<any>> = new Map<number, PacketMapValue<any>>([
    [
        PacketHeaderEnum.HANDSHAKE,
        {
            createPacket: (params = {}) => new HandshakePacket(params),
            createHandler: (params) => new HandshakePacketHandler(params),
            phases: LOGIN_PHASES,
        },
    ],
    [
        PacketHeaderEnum.LOGIN_REQUEST,
        {
            createPacket: (params = {}) => new LoginRequestPacket(params),
            createHandler: (params) => new LoginRequestPacketHandler(params),
            phases: LOGIN_PHASES,
        },
    ],
    [
        PacketHeaderEnum.SERVER_STATUS_REQUEST,
        {
            createPacket: () => new ServerStatusRequestPacket(),
            createHandler: (params) => new ServerStatusRequestPacketHandler(params),
            phases: LOGIN_PHASES,
        },
    ],
    [
        PacketHeaderEnum.TOKEN,
        {
            createPacket: (params = {}) => new AuthTokenPacket(params),
            createHandler: (params) => new AuthTokenPacketHandler(params),
            phases: LOGIN_PHASES,
        },
    ],
    [
        PacketHeaderEnum.EMPIRE,
        {
            createPacket: (params = {}) => new EmpirePacket(params),
            createHandler: (params) => new EmpirePacketHandler(params),
            phases: LOGIN_PHASES,
        },
    ],
    [
        PacketHeaderEnum.CREATE_CHARACTER,
        {
            createPacket: (params = {}) => new CreateCharacterPacket(params),
            createHandler: (params) => new CreateCharacterPacketHandler(params),
            phases: LOGIN_PHASES,
        },
    ],
    [
        PacketHeaderEnum.DELETE_CHARACTER,
        {
            createPacket: (params = {}) => new DeleteCharacterPacket(params),
            createHandler: (params) => new DeleteCharacterPacketHandler(params),
            phases: LOGIN_PHASES,
        },
    ],
    [
        PacketHeaderEnum.SELECT_CHARACTER,
        {
            createPacket: (params = {}) => new SelectCharacterPacket(params),
            createHandler: (params) => new SelectCharacterPacketHandler(params),
            phases: LOGIN_PHASES,
        },
    ],
    [
        PacketHeaderEnum.CLIENT_VERSION,
        {
            createPacket: (params = {}) => new ClientVersionPacket(params),
            createHandler: (params) => new ClientVersionPacketHandler(params),
            phases: LOGIN_PHASES,
        },
    ],
    [
        PacketHeaderEnum.ENTER_GAME,
        {
            createPacket: () => new EnterGamePacket(),
            createHandler: (params) => new EnterGamePacketHandler(params),
            phases: LOGIN_PHASES,
        },
    ],
    [
        PacketHeaderEnum.CHARACTER_MOVE,
        {
            createPacket: (params = {}) => new CharacterMovePacket(params),
            createHandler: (params) => new CharacterMovePacketHandler(params),
            phases: GAME_PHASES,
        },
    ],
    [
        PacketHeaderEnum.CHAT_IN,
        {
            createPacket: (params = {}) => new ChatInPacket(params),
            createHandler: (params) => new ChatInPacketHandler(params),
            phases: GAME_PHASES,
        },
    ],
    [
        PacketHeaderEnum.ITEM_USE,
        {
            createPacket: (params = {}) => new ItemUsePacket(params),
            createHandler: (params) => new ItemUsePacketHandler(params),
            phases: GAME_PHASES,
        },
    ],
    [
        PacketHeaderEnum.ITEM_MOVE,
        {
            createPacket: (params = {}) => new ItemMovePacket(params),
            createHandler: (params) => new ItemMovePacketHandler(params),
            phases: GAME_PHASES,
        },
    ],
    [
        PacketHeaderEnum.ITEM_DROP,
        {
            createPacket: (params = {}) => new ItemDropPacket(params),
            createHandler: (params) => new ItemDropPacketHandler(params),
            phases: GAME_PHASES,
        },
    ],
    [
        PacketHeaderEnum.ITEM_PICKUP,
        {
            createPacket: (params = {}) => new ItemPickupPacket(params),
            createHandler: (params) => new ItemPickupPacketHandler(params),
            phases: GAME_PHASES,
        },
    ],
    [
        PacketHeaderEnum.ATTACK,
        {
            createPacket: (params = {}) => new AttackPacket(params),
            createHandler: (params) => new AttackPacketHandler(params),
            phases: GAME_PHASES,
        },
    ],
    [
        PacketHeaderEnum.TARGET,
        {
            createPacket: (params = {}) => new TargetPacket(params),
            createHandler: (params) => new TargetPacketHandler(params),
            phases: GAME_PHASES,
        },
    ],
    [
        PacketHeaderEnum.INTERNAL_PING,
        {
            createPacket: (params = {}) => new InternalPingPacket(params),
            createHandler: (params) => new InternalPingPacketHandler(params),
            phases: EVERY_PHASE,
        },
    ],
    [
        PacketHeaderEnum.PONG,
        {
            createPacket: () => new PongPacket(),
            createHandler: () => new PongPacketHandler(),
            phases: EVERY_PHASE,
        },
    ],
    [
        PacketHeaderEnum.ON_CLICK,
        {
            createPacket: (params = {}) => new OnClickPacket(params),
            createHandler: (params) => new OnClickPacketHandler(params),
            phases: GAME_PHASES,
        },
    ],
    [
        PacketHeaderEnum.QUEST_ANSWER,
        {
            createPacket: (params = {}) => new QuestAnswerPacket(params),
            createHandler: (params) => new QuestAnswerPacketHandler(params),
            phases: GAME_PHASES,
        },
    ],
    [
        PacketHeaderEnum.QUEST_BUTTON,
        {
            createPacket: (params = {}) => new QuestButtonPacket(params),
            createHandler: (params) => new QuestButtonPacketHandler(params),
            phases: GAME_PHASES,
        },
    ],
    [
        PacketHeaderEnum.SHOP_IN,
        {
            createPacket: () => new ShopPacket(),
            createHandler: (params) => new ShopPacketHandler(params),
            phases: GAME_PHASES,
        },
    ],
    [
        PacketHeaderEnum.PLAYER_SHOP_IN,
        {
            createPacket: () => new MyShopPacket(),
            createHandler: (params) => new MyShopPacketHandler(params),
            phases: GAME_PHASES,
        },
    ],
    [
        PacketHeaderEnum.QUICK_SLOT_ADD_REQUEST,
        {
            createPacket: (params = {}) => new QuickSlotAddRequestPacket(params),
            createHandler: (params) => new QuickSlotAddRequestPacketHandler(params),
            phases: GAME_PHASES,
        },
    ],
    [
        PacketHeaderEnum.QUICK_SLOT_SWAP_REQUEST,
        {
            createPacket: (params = {}) => new QuickSlotSwapRequestPacket(params),
            createHandler: (params) => new QuickSlotSwapRequestPacketHandler(params),
            phases: GAME_PHASES,
        },
    ],
    [
        PacketHeaderEnum.QUICK_SLOT_REMOVE_REQUEST,
        {
            createPacket: (params = {}) => new QuickSlotRemoveRequestPacket(params),
            createHandler: (params) => new QuickSlotRemoveRequestPacketHandler(params),
            phases: GAME_PHASES,
        },
    ],
]);

export const makePackets = () => packets;
