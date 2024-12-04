import PlayerEventsEnum from '../../../core/domain/entities/game/player/events/PlayerEventsEnum.js';
import ConnectionStateEnum from '../../../core/enum/ConnectionStateEnum.js';
import PointsEnum from '../../../core/enum/PointsEnum.js';
import Connection from '../../../core/interface/networking/Connection.js';
import CharacterDiedPacket from '../../../core/interface/networking/packets/packet/out/CharacterDiedPacket.js';
import CharacterInfoPacket from '../../../core/interface/networking/packets/packet/out/CharacterInfoPacket.js';
import CharacterMoveOutPacket from '../../../core/interface/networking/packets/packet/out/CharacterMoveOutPacket.js';
import CharacterPointChangePacket from '../../../core/interface/networking/packets/packet/out/CharacterPointChangePacket.js';
import CharacterPointsPacket from '../../../core/interface/networking/packets/packet/out/CharacterPointsPacket.js';
import CharacterSpawnPacket from '../../../core/interface/networking/packets/packet/out/CharacterSpawnPacket.js';
import CharacterUpdatePacket from '../../../core/interface/networking/packets/packet/out/CharacterUpdatePacket.js';
import ChatOutPacket from '../../../core/interface/networking/packets/packet/out/ChatOutPacket.js';
import DamagePacket from '../../../core/interface/networking/packets/packet/out/DamagePacket.js';
import ItemDroppedHidePacket from '../../../core/interface/networking/packets/packet/out/ItemDroppedHidePacket.js';
import ItemDroppedPacket from '../../../core/interface/networking/packets/packet/out/ItemDroppedPacket.js';
import ItemPacket from '../../../core/interface/networking/packets/packet/out/ItemPacket.js';
import RemoveCharacterPacket from '../../../core/interface/networking/packets/packet/out/RemoveCharacterPacket.js';
import TargetUpdatedPacket from '../../../core/interface/networking/packets/packet/out/TargetUpdatePacket.js';
import SetItemOwnershipPacket from '../../../core/interface/networking/packets/packet/out/SetItemOwnershipPacket.js';
import TeleportPacket from '../../../core/interface/networking/packets/packet/out/TeleportPacket.js';
import Ip from '../../../core/util/Ip.js';
import Queue from '../../../core/util/Queue.js';

const OUTGOING_MESSAGES_PER_CON_QUEUE_SIZE = 5_000;

// const hexString = (buffer) =>
//     buffer.reduce((acc, byte, index) => {
//         // Convertendo o byte para uma string hexadecimal, garantindo dois dígitos e letras maiúsculas
//         const hex = byte.toString(16).padStart(2, '0').toUpperCase();
//         // Adicionando o traço de separação, exceto no primeiro byte
//         return acc + (index > 0 ? '-' : '') + hex;
//     }, '');

export default class GameConnection extends Connection {
    #accountId;
    #outgoingMessages = new Queue(OUTGOING_MESSAGES_PER_CON_QUEUE_SIZE);
    #player;
    #logoutService;
    #config;

    constructor({ logger, socket, logoutService, config }) {
        super({ logger, socket });
        this.#logoutService = logoutService;
        this.#config = config;
    }

    set accountId(value) {
        this.#accountId = value;
    }

    get accountId() {
        return this.#accountId;
    }

    set player(newPlayer) {
        this.#player = newPlayer;
        this.#player.subscribe(PlayerEventsEnum.OTHER_CHARACTER_SPAWNED, this.#onOtherCharacterSpawned.bind(this));
        this.#player.subscribe(PlayerEventsEnum.OTHER_CHARACTER_MOVED, this.#onOtherCharacterMoved.bind(this));
        this.#player.subscribe(PlayerEventsEnum.OTHER_CHARACTER_LEVEL_UP, this.#onOtherCharacterLevelUp.bind(this));
        this.#player.subscribe(PlayerEventsEnum.OTHER_CHARACTER_LEFT_GAME, this.#onOtherCharacterLeftGame.bind(this));
        this.#player.subscribe(PlayerEventsEnum.OTHER_CHARACTER_UPDATED, this.#onOtherCharacterUpdated.bind(this));
        this.#player.subscribe(PlayerEventsEnum.CHARACTER_SPAWNED, this.#onCharacterSpawned.bind(this));
        this.#player.subscribe(PlayerEventsEnum.CHARACTER_POINTS_UPDATED, this.#onCharacterPointsUpdated.bind(this));
        this.#player.subscribe(PlayerEventsEnum.CHARACTER_TELEPORTED, this.#onCharacterTeleported.bind(this));
        this.#player.subscribe(PlayerEventsEnum.CHARACTER_UPDATED, this.#onCharacterUpdated.bind(this));
        this.#player.subscribe(PlayerEventsEnum.ITEM_ADDED, this.#onItemAdded.bind(this));
        this.#player.subscribe(PlayerEventsEnum.ITEM_REMOVED, this.#onItemRemoved.bind(this));
        this.#player.subscribe(PlayerEventsEnum.ITEM_DROPPED, this.#onItemDropped.bind(this));
        this.#player.subscribe(PlayerEventsEnum.ITEM_DROPPED_HIDE, this.#onItemDroppedHide.bind(this));
        this.#player.subscribe(PlayerEventsEnum.CHAT, this.#onChat.bind(this));
        this.#player.subscribe(PlayerEventsEnum.LOGOUT, this.#onLogout.bind(this));
        this.#player.subscribe(PlayerEventsEnum.DAMAGE_CAUSED, this.#onDamageCaused.bind(this));
        this.#player.subscribe(PlayerEventsEnum.TARGET_UPDATED, this.#onTargetUpdated.bind(this));
        this.#player.subscribe(PlayerEventsEnum.OTHER_CHARACTER_DIED, this.#onOtherCharacterDied.bind(this));
    }

    get player() {
        return this.#player;
    }

    #onOtherCharacterDied(otherCharacterDiedEvent) {
        const { virtualId } = otherCharacterDiedEvent;

        this.send(new CharacterDiedPacket({ virtualId }));
    }

    #onTargetUpdated(targetUpdatedEvent) {
        const { virtualId, healthPercentage } = targetUpdatedEvent;
        this.send(
            new TargetUpdatedPacket({
                virtualId,
                healthPercentage,
            }),
        );
    }

    #onDamageCaused(damageCausedEvent) {
        const { virtualId, damage, damageFlags } = damageCausedEvent;
        this.send(
            new DamagePacket({
                virtualId,
                damage,
                damageFlags,
            }),
        );
    }

    #onOtherCharacterUpdated(otherCharacterUpdated) {
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

    #onCharacterUpdated(characterUpdatedEvent) {
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

    #onItemDroppedHide(itemDroppedHideEvent) {
        const { virtualId } = itemDroppedHideEvent;

        this.send(
            new ItemDroppedHidePacket({
                virtualId,
            }),
        );
    }

    #onItemDropped(itemDroppedEvent) {
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

    #onItemRemoved(itemRemovedEvent) {
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
                sockets: 0,
                bonuses: 0,
            }),
        );
    }

    #onItemAdded(itemAddedEvent) {
        const { window, position, id, count, flags, antiFlags, highlight, sockets, bonuses } = itemAddedEvent;

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
                bonuses,
            }),
        );
    }

    #onCharacterTeleported() {
        this.send(
            new TeleportPacket({
                positionX: this.#player.positionX,
                positionY: this.#player.positionY,
                port: this.#config.SERVER_PORT,
                address: Ip.toInt(this.#config.SERVER_ADDRESS),
            }),
        );
    }

    #onLogout() {
        this.close();
    }

    #onChat(chatEvent) {
        const { messageType, message } = chatEvent;
        this.send(
            new ChatOutPacket({
                messageType,
                message,
                vid: this.#player.virtualId,
                empireId: this.#player.empire,
            }),
        );
    }

    #onOtherCharacterLevelUp(otherCharacterLevelUpEvent) {
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

    #onCharacterPointsUpdated() {
        const characterPointsPacket = new CharacterPointsPacket();
        for (const point in this.#player.getPoints()) {
            characterPointsPacket.addPoint(point, this.#player.getPoint(point));
        }
        this.send(characterPointsPacket);
    }

    #onOtherCharacterMoved(otherCharacterMovedEvent) {
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

    #onOtherCharacterLeftGame(otherCharacterLeftGameEvent) {
        const { virtualId } = otherCharacterLeftGameEvent;

        this.send(
            new RemoveCharacterPacket({
                vid: virtualId,
            }),
        );
    }

    #onOtherCharacterSpawned(OtherCharacterSpawnedEvent) {
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
        } = OtherCharacterSpawnedEvent;

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

    #onCharacterSpawned() {
        this.send(
            new CharacterSpawnPacket({
                vid: this.#player.virtualId,
                playerClass: this.#player.playerClass,
                entityType: this.#player.entityType,
                attackSpeed: this.#player.attackSpeed,
                movementSpeed: this.#player.movementSpeed,
                positionX: this.#player.positionX,
                positionY: this.#player.positionY,
                positionZ: 0,
            }),
        );
        //TODO: we only need to send this for player, verify if we need to send to NPC too
        this.send(
            new CharacterInfoPacket({
                vid: this.#player.virtualId,
                empireId: this.#player.empire,
                level: this.#player.level,
                playerName: this.#player.name,
                guildId: 0, //todo
                mountId: 0, //todo
                pkMode: 0, //todo
                rankPoints: 0, //todo
            }),
        );
    }

    onHandshakeSuccess() {
        this.logger.info('[HANDSHAKE] Finished');
        this.state = ConnectionStateEnum.LOGIN;
    }

    send(packet) {
        this.#outgoingMessages.enqueue(packet.pack());
    }

    async sendPendingMessages() {
        for (const message of this.#outgoingMessages.dequeueIterator()) {
            this.socket.write(message);
        }
    }

    async onClose() {
        if (this.#player) {
            return this.#logoutService.execute(this.#player);
        }
    }

    async saveAndDestroy() {
        super.close();
        return this.onClose();
    }
}
