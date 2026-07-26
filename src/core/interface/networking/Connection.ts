import { randomBytes, randomUUID } from 'crypto';
import { Socket } from 'node:net';
import ConnectionStatePacket from './packets/packet/out/ConnectionStatePacket';
import { ConnectionStateEnum } from '../../enum/ConnectionStateEnum';
import Logger from '@/core/infra/logger/Logger';
import HandshakePacket from './packets/packet/bidirectional/handshake/HandshakePacket';
import PingPacket from './packets/packet/out/PingPacket';

const KEEPALIVE_INTERVAL_MS = 60_000;

export default abstract class Connection {
    protected id: string;
    protected state: ConnectionStateEnum = ConnectionStateEnum.CLOSE;
    protected socket: Socket;
    protected logger: Logger;

    private lastHandshake: HandshakePacket | null = null;
    private keepaliveTimer: NodeJS.Timeout | null = null;
    private pongReceived = true;

    constructor({ socket, logger }: { socket: Socket; logger: Logger }) {
        this.id = randomUUID();
        this.socket = socket;
        this.logger = logger;
    }

    /**
     * Periodically ping the client (GC_PING) like the original server does:
     * the client answers with CG_PONG and treats the traffic as proof the
     * connection is alive — without it, the client drops the link after a
     * few idle minutes. Connections that stop answering are closed.
     */
    startKeepalive(intervalMs: number = KEEPALIVE_INTERVAL_MS) {
        if (this.keepaliveTimer) return;

        this.keepaliveTimer = setInterval(() => {
            if (!this.pongReceived) {
                this.logger.debug(`[KEEPALIVE] No pong from connection: ID: ${this.id}, closing`);
                this.close();
                return;
            }

            this.pongReceived = false;
            this.send(new PingPacket());
        }, intervalMs);
    }

    stopKeepalive() {
        if (!this.keepaliveTimer) return;
        clearInterval(this.keepaliveTimer);
        this.keepaliveTimer = null;
    }

    onPongReceived() {
        this.pongReceived = true;
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
        if (this.state === ConnectionStateEnum.CLOSE) {
            this.close();
        }
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
    abstract send<T>(packet: T): void;

    close() {
        this.stopKeepalive();
        this.socket.destroy();
    }
}
