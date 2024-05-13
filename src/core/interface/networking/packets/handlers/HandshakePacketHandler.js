import ConnectionStateEnum from '../../../../enum/ConnectionStateEnum.js';
import HandshakePacket from '../packet/bidirectional/HandshakePacket.js';

export default class HandshakePacketHandler {
    #logger;

    constructor({ logger }) {
        this.#logger = logger;
    }

    async execute(connection, packet) {
        const delta = performance.now() - (packet.time + packet.delta);

        const isSynchEnough = delta >= 0 && delta <= 50;

        if (!isSynchEnough) {
            this.#logger.info(
                `Handshake is not synchronized enough: ${Math.floor(delta)} ms, sending hadshake again..`,
            );
            const newDelta = (performance.now() - packet.time) / 2;
            connection.send(
                new HandshakePacket({
                    id: packet.id,
                    time: performance.now(),
                    delta: newDelta,
                }),
            );
            return;
        }

        this.#logger.info(`Server and client is synchronized enough with delta: ${Math.floor(delta)} ms`);
        connection.state = ConnectionStateEnum.AUTH;
    }
}
