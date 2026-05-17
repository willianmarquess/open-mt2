import Logger from '@/core/infra/logger/Logger';
import PacketHandler from '../../PacketHandler';
import HandshakePacket from './HandshakePacket';
import GameConnection from '@/game/interface/networking/GameConnection';

export default class HandshakePacketHandler extends PacketHandler<HandshakePacket> {
    private readonly logger: Logger;

    constructor({ logger }: { logger: Logger }) {
        super();
        this.logger = logger;
    }

    async execute(connection: GameConnection, packet: HandshakePacket): Promise<void> {
        if (!packet.isValid()) {
            this.logger.error(`[AuthTokenPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage()!);
            connection.close();
            return;
        }

        const lastHandshake = connection.getLastHandshake();

        if (!lastHandshake) {
            this.logger.info(
                `[HANDSHAKE] No handshake was sent to the client, but a handshake response was received..`,
            );
            this.logger.info(`[HANDSHAKE] Send close connection..`);
            connection.close();
            return;
        }

        if (packet.getId() !== lastHandshake.getId()) {
            this.logger.info(`[HANDSHAKE] A different package was received than the one sent..`);
            this.logger.info(`[HANDSHAKE] Send close connection..`);
            connection.close();
            return;
        }

        const currentTime = performance.now();
        const delta = currentTime - (packet.getTime() + packet.getDelta());
        const isSynchEnough = delta >= 0 && delta <= 500;

        if (isSynchEnough) {
            this.logger.info(
                `[HANDSHAKE] Server and client is synchronized enough with delta: ${Math.floor(delta)} ms`,
            );
            connection.onHandshakeSuccess();
            return;
        }

        this.logger.info(`[HANDSHAKE] Is not synchronized enough: ${Math.floor(delta)} ms, sending handshake again..`);
        let newDelta = (currentTime - packet.getTime()) / 2;

        if (newDelta < 0) {
            this.logger.info(
                `[HANDSHAKE] Is too low ${Math.floor(delta)}, calculating new delta using this value: ${lastHandshake.getTime()}`,
            );
            newDelta = (currentTime - lastHandshake.getTime()) / 2;
        }

        const handshake = new HandshakePacket({
            id: packet.getId(),
            time: currentTime,
            delta: newDelta,
        });
        connection.setLastHandshake(handshake);
        connection.send(handshake);
    }
}
