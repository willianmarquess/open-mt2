import ConnectionStateEnum from '../../../../enum/ConnectionStateEnum.js';
import HandshakePacket from '../packet/bidirectional/HandshakePacket.js';

export default class HandshakePacketHandler {
    #logger;

    constructor({ logger }) {
        this.#logger = logger;
    }

    async execute(connection, packet) {
        if (packet.id !== connection.lastHandshake.id) {
            this.#logger.info(`[HANDSHAKE] A different package was received than the one sent..`);
            this.#logger.info(`[HANDSHAKE] Send phase to close..`);
            connection.state = ConnectionStateEnum.CLOSE;
            return;
        }

        const currentTime = performance.now();
        const delta = currentTime - (packet.time + packet.delta);
        const isSynchEnough = delta >= 0 && delta <= 50;

        if (isSynchEnough) {
            this.#logger.info(
                `[HANDSHAKE] Server and client is synchronized enough with delta: ${Math.floor(delta)} ms`,
            );
            connection.state = ConnectionStateEnum.AUTH;
            return;
        }

        this.#logger.info(`[HANDSHAKE] Is not synchronized enough: ${Math.floor(delta)} ms, sending hadshake again..`);

        let newDelta = (currentTime - packet.time) / 2;

        if (newDelta < 0) {
            this.#logger.info(
                `[HANDSHAKE] Is too low ${delta}, calculating new delta using this value: ${connection.lastHandshake.time}`,
            );
            newDelta = (currentTime - connection.lastHandshake.time) / 2;
        }

        connection.send(
            new HandshakePacket({
                id: packet.id,
                time: currentTime,
                delta: newDelta,
            }),
        );
    }
}
