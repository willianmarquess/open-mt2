import { randomBytes, randomUUID } from 'crypto';
import { Socket } from 'node:net';
import ConnectionStatePacket from './packets/packet/out/ConnectionStatePacket';
import { ConnectionStateEnum } from '../../enum/ConnectionStateEnum';
import Logger from '@/core/infra/logger/Logger';
import Packet from '@/core/interface/networking/packets/packet/Packet';
import HandshakePacket from './packets/packet/bidirectional/handshake/HandshakePacket';

export default abstract class Connection {
    protected id: string;
    protected state: ConnectionStateEnum;
    protected socket: Socket;
    protected logger: Logger;

    private lastHandshake: HandshakePacket;

    constructor({ socket, logger }) {
        this.id = randomUUID();
        this.socket = socket;
        this.logger = logger;
    }

    setLastHandshake(value: HandshakePacket) {
        this.lastHandshake = value;
    }

    getLastHandshake() {
        return this.lastHandshake;
    }

    setState(value: ConnectionStateEnum) {
        this.state = value;
        this.updateState();
    }

    getId() {
        return this.id;
    }

    updateState() {
        this.logger.debug(`[OUT][STATE] value: ${this.state}`);
        this.send(new ConnectionStatePacket({ state: this.state }));
    }

    startHandShake() {
        this.setState(ConnectionStateEnum.HANDSHAKE);
        const id = randomBytes(4).readUInt32LE();
        const handshake = new HandshakePacket({
            id,
            time: performance.now(),
            delta: 0,
        });
        this.lastHandshake = handshake;
        this.send(handshake);
    }

    abstract onHandshakeSuccess(): void;
    abstract send(data: Packet): void;

    close() {
        this.socket.destroy();
    }
}
