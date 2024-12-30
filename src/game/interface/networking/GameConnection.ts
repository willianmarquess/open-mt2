import { ConnectionStateEnum } from '../../../core/enum/ConnectionStateEnum';
import { PointsEnum } from '../../../core/enum/PointsEnum';
import Connection from '../../../core/interface/networking/Connection';
import CharacterDiedPacket from '../../../core/interface/networking/packets/packet/out/CharacterDiedPacket';
import CharacterInfoPacket from '../../../core/interface/networking/packets/packet/out/CharacterInfoPacket';
import CharacterMoveOutPacket from '../../../core/interface/networking/packets/packet/out/CharacterMoveOutPacket';
import CharacterPointChangePacket from '../../../core/interface/networking/packets/packet/out/CharacterPointChangePacket';
import CharacterPointsPacket from '../../../core/interface/networking/packets/packet/out/CharacterPointsPacket';
import CharacterSpawnPacket from '../../../core/interface/networking/packets/packet/out/CharacterSpawnPacket';
import CharacterUpdatePacket from '../../../core/interface/networking/packets/packet/out/CharacterUpdatePacket';
import ChatOutPacket from '../../../core/interface/networking/packets/packet/out/ChatOutPacket';
import DamagePacket from '../../../core/interface/networking/packets/packet/out/DamagePacket';
import ItemDroppedHidePacket from '../../../core/interface/networking/packets/packet/out/ItemDroppedHidePacket';
import ItemDroppedPacket from '../../../core/interface/networking/packets/packet/out/ItemDroppedPacket';
import ItemPacket from '../../../core/interface/networking/packets/packet/out/ItemPacket';
import RemoveCharacterPacket from '../../../core/interface/networking/packets/packet/out/RemoveCharacterPacket';
import TargetUpdatedPacket from '../../../core/interface/networking/packets/packet/out/TargetUpdatePacket';
import SetItemOwnershipPacket from '../../../core/interface/networking/packets/packet/out/SetItemOwnershipPacket';
import TeleportPacket from '../../../core/interface/networking/packets/packet/out/TeleportPacket';
import Ip from '../../../core/util/Ip';
import Queue from '../../../core/util/Queue';
import Player from '@/core/domain/entities/game/player/Player';
import { GameConfig } from '@/game/infra/config/GameConfig';
import LogoutService from '@/game/app/service/LogoutService';
import OtherCharacterSpawnedEvent from '@/core/domain/entities/game/player/events/OtherCharacterSpawnedEvent';
import OtherCharacterMovedEvent from '@/core/domain/entities/game/player/events/OtherCharacterMovedEvent';
import OtherCharacterLevelUpEvent from '@/core/domain/entities/game/player/events/OtherCharacterLevelUpEvent';
import OtherCharacterLeftGameEvent from '@/core/domain/entities/game/player/events/OtherCharacterLeftGameEvent';
import OtherCharacterUpdatedEvent from '@/core/domain/entities/game/player/events/OtherCharacterUpdatedEvent';
import CharacterSpawnedEvent from '@/core/domain/entities/game/player/events/CharacterSpawnedEvent';
import CharacterPointsUpdatedEvent from '@/core/domain/entities/game/player/events/CharacterPointsUpdatedEvent';
import CharacterTeleportedEvent from '@/core/domain/entities/game/player/events/CharacterTeleportedEvent';
import CharacterUpdatedEvent from '@/core/domain/entities/game/player/events/CharacterUpdatedEvent';
import ItemAddedEvent from '@/core/domain/entities/game/player/events/ItemAddedEvent';
import ItemRemovedEvent from '@/core/domain/entities/game/player/events/ItemRemovedEvent';
import ItemDroppedEvent from '@/core/domain/entities/game/player/events/ItemDroppedEvent';
import ItemDroppedHideEvent from '@/core/domain/entities/game/player/events/ItemDroppedHideEvent';
import ChatEvent from '@/core/domain/entities/game/player/events/ChatEvent';
import LogoutEvent from '@/core/domain/entities/game/player/events/LogoutEvent';
import DamageCausedEvent from '@/core/domain/entities/game/player/events/DamageCausedEvent';
import TargetUpdatedEvent from '@/core/domain/entities/game/player/events/TargetUpdatedEvent';
import OtherCharacterDiedEvent from '@/core/domain/entities/game/player/events/OtherCharacterDiedEvent';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';
import PacketBidirectional from '@/core/interface/networking/packets/packet/bidirectional/PacketBidirectional';
import ShowFlyEffectEvent from '@/core/domain/entities/game/player/events/ShowFlyEffectEvent';
import FlyPacket from '@/core/interface/networking/packets/packet/out/FlyPacket';

const OUTGOING_MESSAGES_PER_CON_QUEUE_SIZE = 5_000;

// const hexString = (buffer) =>
//     buffer.reduce((acc, byte, index) => {
//         // Convertendo o byte para uma string hexadecimal, garantindo dois dígitos e letras maiúsculas
//         const hex = byte.toString(16).padStart(2, '0').toUpperCase();
//         // Adicionando o traço de separação, exceto no primeiro byte
//         return acc + (index > 0 ? '-' : '') + hex;
//     }, '');

export default class GameConnection extends Connection {
    private accountId: number;
    private outgoingMessages = new Queue(OUTGOING_MESSAGES_PER_CON_QUEUE_SIZE);
    private player: Player;
    private logoutService: LogoutService;
    private config: GameConfig;

    constructor({ logger, socket, logoutService, config }) {
        super({ logger, socket });
        this.logoutService = logoutService;
        this.config = config;
    }

    setAccountId(value: number) {
        this.accountId = value;
    }

    getAccountId() {
        return this.accountId;
    }

    setPlayer(newPlayer: Player) {
        this.player = newPlayer;
        this.player.subscribe(OtherCharacterSpawnedEvent, this.onOtherCharacterSpawned.bind(this));
        this.player.subscribe(OtherCharacterMovedEvent, this.onOtherCharacterMoved.bind(this));
        this.player.subscribe(OtherCharacterLevelUpEvent, this.onOtherCharacterLevelUp.bind(this));
        this.player.subscribe(OtherCharacterLeftGameEvent, this.onOtherCharacterLeftGame.bind(this));
        this.player.subscribe(OtherCharacterUpdatedEvent, this.onOtherCharacterUpdated.bind(this));
        this.player.subscribe(CharacterSpawnedEvent, this.onCharacterSpawned.bind(this));
        this.player.subscribe(CharacterPointsUpdatedEvent, this.onCharacterPointsUpdated.bind(this));
        this.player.subscribe(CharacterTeleportedEvent, this.onCharacterTeleported.bind(this));
        this.player.subscribe(CharacterUpdatedEvent, this.onCharacterUpdated.bind(this));
        this.player.subscribe(ItemAddedEvent, this.onItemAdded.bind(this));
        this.player.subscribe(ItemRemovedEvent, this.onItemRemoved.bind(this));
        this.player.subscribe(ItemDroppedEvent, this.onItemDropped.bind(this));
        this.player.subscribe(ItemDroppedHideEvent, this.onItemDroppedHide.bind(this));
        this.player.subscribe(ChatEvent, this.onChat.bind(this));
        this.player.subscribe(LogoutEvent, this.onLogout.bind(this));
        this.player.subscribe(DamageCausedEvent, this.onDamageCaused.bind(this));
        this.player.subscribe(TargetUpdatedEvent, this.onTargetUpdated.bind(this));
        this.player.subscribe(OtherCharacterDiedEvent, this.onOtherCharacterDied.bind(this));
        this.player.subscribe(ShowFlyEffectEvent, this.onFlyEffectEvent.bind(this));
    }

    getPlayer() {
        return this.player;
    }

    onFlyEffectEvent(showFlyEvent: ShowFlyEffectEvent) {
        const { type, fromVirtualId, toVirtualId } = showFlyEvent;
        this.send(
            new FlyPacket({
                fromVirtualId,
                toVirtualId,
                type,
            }),
        );
    }

    onOtherCharacterDied(otherCharacterDiedEvent: OtherCharacterDiedEvent) {
        const { virtualId } = otherCharacterDiedEvent;

        this.send(new CharacterDiedPacket({ virtualId }));
    }

    onTargetUpdated(targetUpdatedEvent: TargetUpdatedEvent) {
        const { virtualId, healthPercentage } = targetUpdatedEvent;
        this.send(
            new TargetUpdatedPacket({
                virtualId,
                healthPercentage,
            }),
        );
    }

    onDamageCaused(damageCausedEvent: DamageCausedEvent) {
        const { virtualId, damage, damageFlags } = damageCausedEvent;
        this.send(
            new DamagePacket({
                virtualId,
                damage,
                damageFlags,
            }),
        );
    }

    onOtherCharacterUpdated(otherCharacterUpdated: OtherCharacterUpdatedEvent) {
        const { attackSpeed, moveSpeed, vid, bodyId, weaponId, hairId } = otherCharacterUpdated;

        this.send(
            new CharacterUpdatePacket({
                vid,
                attackSpeed,
                moveSpeed,
                parts: [bodyId, weaponId, 0, hairId],
            }),
        );
    }

    onCharacterUpdated(characterUpdatedEvent: CharacterUpdatedEvent) {
        const { attackSpeed, moveSpeed, vid, bodyId, weaponId, hairId } = characterUpdatedEvent;

        this.send(
            new CharacterUpdatePacket({
                vid,
                attackSpeed,
                moveSpeed,
                parts: [bodyId, weaponId, 0, hairId],
            }),
        );
    }

    onItemDroppedHide(itemDroppedHideEvent: ItemDroppedHideEvent) {
        const { virtualId } = itemDroppedHideEvent;

        this.send(
            new ItemDroppedHidePacket({
                virtualId,
            }),
        );
    }

    onItemDropped(itemDroppedEvent: ItemDroppedEvent) {
        const { id, positionX, positionY, virtualId, ownerName } = itemDroppedEvent;

        this.send(
            new ItemDroppedPacket({
                id,
                positionX,
                positionY,
                virtualId,
            }),
        );

        this.send(
            new SetItemOwnershipPacket({
                ownerName,
                virtualId,
            }),
        );
    }

    onItemRemoved(itemRemovedEvent: ItemRemovedEvent) {
        const { window, position } = itemRemovedEvent;

        this.send(
            new ItemPacket({
                window,
                position,
                id: 0,
                count: 0,
                flags: 0,
                antiFlags: 0,
                highlight: 0,
            }),
        );
    }

    onItemAdded(itemAddedEvent: ItemAddedEvent) {
        const { window, position, id, count, flags, antiFlags, highlight, sockets } = itemAddedEvent;

        this.send(
            new ItemPacket({
                window,
                position,
                id,
                count,
                flags,
                antiFlags,
                highlight,
                sockets,
            }),
        );
    }

    onCharacterTeleported() {
        this.send(
            new TeleportPacket({
                positionX: this.player.getPositionX(),
                positionY: this.player.getPositionY(),
                port: Number(this.config.SERVER_PORT),
                address: Ip.toInt(this.config.SERVER_ADDRESS),
            }),
        );
    }

    onLogout() {
        this.close();
    }

    onChat(chatEvent: ChatEvent) {
        const { messageType, message } = chatEvent;
        this.send(
            new ChatOutPacket({
                messageType,
                message,
                vid: this.player.getVirtualId(),
                empireId: this.player.getEmpire(),
            }),
        );
    }

    onOtherCharacterLevelUp(otherCharacterLevelUpEvent: OtherCharacterLevelUpEvent) {
        const { virtualId, level } = otherCharacterLevelUpEvent;

        this.send(
            new CharacterPointChangePacket({
                vid: virtualId,
                type: PointsEnum.LEVEL,
                amount: 0,
                value: level,
            }),
        );
    }

    onCharacterPointsUpdated() {
        const characterPointsPacket = new CharacterPointsPacket();
        for (const point in this.player.getPoints()) {
            characterPointsPacket.addPoint(Number(point), this.player.getPoint(Number(point) as PointsEnum));
        }
        this.send(characterPointsPacket);
    }

    onOtherCharacterMoved(otherCharacterMovedEvent: OtherCharacterMovedEvent) {
        const { virtualId, arg, duration, movementType, time, rotation, positionX, positionY } =
            otherCharacterMovedEvent;

        this.send(
            new CharacterMoveOutPacket({
                vid: virtualId,
                arg,
                movementType,
                time,
                rotation,
                positionX,
                positionY,
                duration,
            }),
        );
    }

    onOtherCharacterLeftGame(otherCharacterLeftGameEvent: OtherCharacterLeftGameEvent) {
        const { virtualId } = otherCharacterLeftGameEvent;

        this.send(
            new RemoveCharacterPacket({
                vid: virtualId,
            }),
        );
    }

    onOtherCharacterSpawned(otherCharacterSpawnedEvent: OtherCharacterSpawnedEvent) {
        const {
            virtualId,
            playerClass,
            entityType,
            attackSpeed,
            movementSpeed,
            positionX,
            positionY,
            empireId,
            level,
            name,
            rotation,
        } = otherCharacterSpawnedEvent;

        this.send(
            new CharacterSpawnPacket({
                vid: virtualId,
                playerClass,
                entityType,
                attackSpeed,
                movementSpeed,
                positionX,
                positionY,
                positionZ: 0,
                rotation,
            }),
        );

        this.send(
            new CharacterInfoPacket({
                vid: virtualId,
                empireId,
                level,
                playerName: name,
                guildId: 0, //todo
                mountId: 0, //todo
                pkMode: 0, //todo
                rankPoints: 0, //todo
            }),
        );
    }

    onCharacterSpawned() {
        this.send(
            new CharacterSpawnPacket({
                vid: this.player.getVirtualId(),
                playerClass: this.player.getPlayerClass(),
                entityType: this.player.getEntityType(),
                attackSpeed: this.player.getAttackSpeed(),
                movementSpeed: this.player.getMovementSpeed(),
                positionX: this.player.getPositionX(),
                positionY: this.player.getPositionY(),
                positionZ: 0,
            }),
        );
        //TODO: we only need to send this for player, verify if we need to send to NPC too
        this.send(
            new CharacterInfoPacket({
                vid: this.player.getVirtualId(),
                empireId: this.player.getEmpire(),
                level: this.player.getLevel(),
                playerName: this.player.getName(),
                guildId: 0, //todo
                mountId: 0, //todo
                pkMode: 0, //todo
                rankPoints: 0, //todo
            }),
        );
    }

    onHandshakeSuccess() {
        this.logger.info('[HANDSHAKE] Finished');
        this.setState(ConnectionStateEnum.LOGIN);
    }

    send(packet: PacketOut | PacketBidirectional) {
        this.outgoingMessages.enqueue(packet.pack());
    }

    async sendPendingMessages() {
        for (const message of this.outgoingMessages.dequeueIterator()) {
            this.socket.write(message);
        }
    }

    async onClose() {
        if (this.player) {
            return this.logoutService.execute(this.player);
        }
    }

    async saveAndDestroy() {
        super.close();
        return this.onClose();
    }
}
