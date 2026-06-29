import { ConnectionStateEnum } from '../../../core/enum/ConnectionStateEnum';
import Connection from '../../../core/interface/networking/Connection';
import Player from '@/core/domain/entities/game/player/Player';
import { Socket } from 'net';
import Logger from '@/core/infra/logger/Logger';

// const hexString = (buffer) =>
//     buffer.reduce((acc, byte, index) => {
//         // Convertendo o byte para uma string hexadecimal, garantindo dois dígitos e letras maiúsculas
//         const hex = byte.toString(16).padStart(2, '0').toUpperCase();
//         // Adicionando o traço de separação, exceto no primeiro byte
//         return acc + (index > 0 ? '-' : '') + hex;
//     }, '');

export default class GameConnection extends Connection {
    private accountId: number | null = null;
    private player: Player | null = null;

    constructor({ logger, socket }: { logger: Logger; socket: Socket }) {
        super({ logger, socket });
    }

    cork() {
        this.socket.cork();
    }

    uncork() {
        this.socket.uncork();
    }

    setAccountId(value: number) {
        this.accountId = value;
    }

    getAccountId() {
        return this.accountId;
    }

    setPlayer(newPlayer: Player) {
        this.player = newPlayer;
        this.player.setConnection(this);
    }

    getPlayer() {
        return this.player;
    }

    onHandshakeSuccess() {
        this.logger.info('[HANDSHAKE] Finished');
        this.setState(ConnectionStateEnum.LOGIN);
    }

    send<T>(packet: T & { pack: () => Buffer }) {
        this.socket.write(packet.pack());
    }
}
