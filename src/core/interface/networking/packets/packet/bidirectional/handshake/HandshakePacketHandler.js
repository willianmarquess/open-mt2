import HandshakePacket from './HandshakePacket.js';

export default class HandshakePacketHandler {
    #logger;

    constructor({ logger }) {
        this.#logger = logger;
    }

    async execute(connection, packet) {
        if (!packet.isValid()) {
            this.#logger.error(`[AuthTokenPacketHandler] Packet invalid`);
            this.#logger.error(packet.errors());
            connection.close();
            return;
        }

        if (packet.id !== connection.lastHandshake.id) {
            this.#logger.info(`[HANDSHAKE] A different package was received than the one sent..`);
            this.#logger.info(`[HANDSHAKE] Send close connection..`);
            connection.close();
            return;
        }

        const currentTime = performance.now();
        const delta = currentTime - (packet.time + packet.delta);
        const isSynchEnough = delta >= 0 && delta <= 50;

        if (isSynchEnough) {
            this.#logger.info(
                `[HANDSHAKE] Server and client is synchronized enough with delta: ${Math.floor(delta)} ms`,
            );
            connection.onHandshakeSuccess();
            return;
        }

        this.#logger.info(`[HANDSHAKE] Is not synchronized enough: ${Math.floor(delta)} ms, sending hadshake again..`);
        let newDelta = (currentTime - packet.time) / 2;

        if (newDelta < 0) {
            this.#logger.info(
                `[HANDSHAKE] Is too low ${Math.floor(delta)}, calculating new delta using this value: ${connection.lastHandshake.time}`,
            );
            newDelta = (currentTime - connection.lastHandshake.time) / 2;
        }

        const handshake = new HandshakePacket({
            id: packet.id,
            time: currentTime,
            delta: newDelta,
        });
        connection.lastHandshake = handshake;
        connection.send(handshake);
    }
}
