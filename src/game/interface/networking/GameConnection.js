import PlayerEventsEnum from '../../../core/domain/entities/player/events/PlayerEventsEnum.js';
import ConnectionStateEnum from '../../../core/enum/ConnectionStateEnum.js';
import MovementTypeEnum from '../../../core/enum/MovementTypeEnum.js';
import PointsEnum from '../../../core/enum/PointsEnum.js';
import Connection from '../../../core/interface/networking/Connection.js';
import CharacterInfoPacket from '../../../core/interface/networking/packets/packet/out/CharacterInfoPacket.js';
import CharacterMoveOutPacket from '../../../core/interface/networking/packets/packet/out/CharacterMoveOutPacket.js';
import CharacterPointChangePacket from '../../../core/interface/networking/packets/packet/out/CharacterPointChangePacket.js';
import CharacterPointsPacket from '../../../core/interface/networking/packets/packet/out/CharacterPointsPacket.js';
import CharacterSpawnPacket from '../../../core/interface/networking/packets/packet/out/CharacterSpawnPacket.js';
import Queue from '../../../core/util/Queue.js';

const OUTGOING_MESSAGES_PER_CON_QUEUE_SIZE = 100;

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

    set accountId(value) {
        this.#accountId = value;
    }

    get accountId() {
        return this.#accountId;
    }

    set player(newPlayer) {
        this.#player = newPlayer;
        this.#player.subscribe(PlayerEventsEnum.OTHER_CHARACTER_UPDATED, this.#onOtherCharacterUpdated.bind(this));
        this.#player.subscribe(PlayerEventsEnum.OTHER_CHARACTER_MOVED, this.#onOtherCharacterMoved.bind(this));
        this.#player.subscribe(PlayerEventsEnum.OTHER_CHARACTER_LEVEL_UP, this.#onOtherCharacterLevelUp.bind(this));
        this.#player.subscribe(PlayerEventsEnum.CHARACTER_SPAWNED, this.#onCharacterSpawned.bind(this));
        this.#player.subscribe(PlayerEventsEnum.CHARACTER_POINTS_UPDATED, this.#onCharacterPointsUpdated.bind(this));
    }

    get player() {
        return this.#player;
    }

    #onOtherCharacterLevelUp(otherCharacterLevelUpEvent) {
        const { otherEntity } = otherCharacterLevelUpEvent;

        // this.send(
        //     new CharacterInfoPacket({
        //         vid: otherEntity.virtualId,
        //         empireId: otherEntity.empire,
        //         guildId: 0, //todo
        //         level: otherEntity.level,
        //         mountId: 0, //todo
        //         pkMode: 0, //todo
        //         playerName: otherEntity.name,
        //         rankPoints: 0, //todo
        //     }),
        // );

        this.send(
            new CharacterPointChangePacket({
                vid: otherEntity.virtualId,
                type: PointsEnum.LEVEL,
                amount: 0,
                value: otherEntity.level,
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
        const { otherEntity, params } = otherCharacterMovedEvent;

        this.send(
            new CharacterMoveOutPacket({
                vid: otherEntity.virtualId,
                arg: params.arg,
                movementType: params.movementType,
                time: params.time,
                rotation: params.rotation,
                positionX: params.positionX,
                positionY: params.positionY,
                duration: params.movementType === MovementTypeEnum.MOVE ? otherEntity.movementDuration : 0,
            }),
        );
    }

    #onOtherCharacterUpdated(otherCharacterUpdatedEvent) {
        const { otherEntity } = otherCharacterUpdatedEvent;

        this.send(
            new CharacterSpawnPacket({
                vid: otherEntity.virtualId,
                playerClass: otherEntity.playerClass,
                entityType: otherEntity.entityType,
                attackSpeed: otherEntity.attackSpeed,
                moveSpeed: otherEntity.movementSpeed,
                positionX: otherEntity.positionX,
                positionY: otherEntity.positionY,
                positionZ: 0,
            }),
        );

        this.send(
            new CharacterInfoPacket({
                vid: otherEntity.virtualId,
                empireId: otherEntity.empire,
                guildId: 0, //todo
                level: otherEntity.level,
                mountId: 0, //todo
                pkMode: 0, //todo
                playerName: otherEntity.name,
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
                moveSpeed: this.#player.movementSpeed,
                positionX: this.#player.positionX,
                positionY: this.#player.positionY,
                positionZ: 0,
            }),
        );
        this.send(
            new CharacterInfoPacket({
                vid: this.#player.virtualId,
                empireId: this.#player.empire,
                guildId: 0, //todo
                level: this.#player.level,
                mountId: 0, //todo
                pkMode: 0, //todo
                playerName: this.#player.name,
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
}
