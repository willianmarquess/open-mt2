import { ConnectionStateEnum } from '../../../core/enum/ConnectionStateEnum';
import Connection from '../../../core/interface/networking/Connection';
import Player from '@/core/domain/entities/game/player/Player';
import { GameConfig } from '@/game/infra/config/GameConfig';
import LogoutService from '@/game/app/service/LogoutService';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';
import PacketBidirectional from '@/core/interface/networking/packets/packet/bidirectional/PacketBidirectional';

// const hexString = (buffer) =>
//     buffer.reduce((acc, byte, index) => {
//         // Convertendo o byte para uma string hexadecimal, garantindo dois dígitos e letras maiúsculas
//         const hex = byte.toString(16).padStart(2, '0').toUpperCase();
//         // Adicionando o traço de separação, exceto no primeiro byte
//         return acc + (index > 0 ? '-' : '') + hex;
//     }, '');

export default class GameConnection extends Connection {
    private accountId: number;
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
        this.player.setConnection(this);
    }

    getPlayer() {
        return this.player;
    }

    onHandshakeSuccess() {
        this.logger.info('[HANDSHAKE] Finished');
        this.setState(ConnectionStateEnum.LOGIN);
    }

    send(packet: PacketOut | PacketBidirectional) {
        this.socket.write(packet.pack());
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
