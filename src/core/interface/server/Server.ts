import { createServer, Server as SocketServer, Socket } from 'node:net';
import Connection from '@/core/interface/networking/Connection';
import Logger from '@/core/infra/logger/Logger';
import { PacketMapValue } from '@/core/interface/networking/packets/Packets';
import { GameConfig } from '@/game/infra/config/GameConfig';
import { ConnectionStateEnum } from '@/core/enum/ConnectionStateEnum';

const MAX_PACKET_LENGTH = 1024;
const MAX_RECEIVE_BUFFER = 16_384;

type FrameState = {
    buffer: Buffer;
    draining: boolean;
};

export default abstract class Server {
    protected server!: SocketServer;
    protected readonly connections = new Map<string, Connection>();
    private readonly frameStates = new Map<string, FrameState>();
    protected readonly logger: Logger;
    protected readonly config: GameConfig;
    protected readonly container: any;
    protected readonly packets: Map<number, PacketMapValue<any>>;
    protected isShuttingDown = false;

    constructor(container: { logger: Logger; config: GameConfig; packets: Map<number, PacketMapValue<any>> }) {
        this.logger = container.logger;
        this.config = container.config;
        this.container = container;
        this.packets = container.packets;
    }

    setup() {
        this.server = createServer(this.onListener.bind(this));
        return this;
    }

    abstract createConnection(socket: Socket): Connection;
    abstract onData(connection: Connection, data: Buffer): Promise<void>;

    /**
     * Unpacks a packet, closing the connection instead of letting a malformed
     * packet throw. A packet lying about its size makes unpack() read past the
     * buffer and throw; if that rejection escaped the socket 'data' listener it
     * would surface as an unhandledRejection and take the whole process down.
     */
    protected unpackPacket<T extends { unpack(data: Buffer): T; getName(): string }>(
        connection: Connection,
        packet: T,
        data: Buffer,
    ): T | null {
        try {
            return packet.unpack(data);
        } catch (error) {
            this.logger.error(
                `[IN][PACKET] Malformed ${packet.getName()} packet from connection: ID: ${connection.getId()}, closing. ${error}`,
            );
            connection.close();
            return null;
        }
    }

    onListener(socket: Socket) {
        socket.setNoDelay(true);
        const connection = this.createConnection(socket);
        this.connections.set(connection.getId(), connection);

        this.logger.debug(`[IN][CONNECT SOCKET EVENT] New connection: ID: ${connection.getId()}`);
        connection.startHandShake();
        connection.startKeepalive();

        socket.on('close', this.onClose.bind(this, connection));
        socket.on('data', (chunk: Buffer) => {
            this.handleData(connection, chunk).catch((err) => this.logger.error(err));
        });
        socket.on('error', this.onError.bind(this, connection));
    }

    /**
     * TCP has no message boundaries: a read can carry several packets, or part
     * of one. The drain is serialized per connection so packets stay in
     * arrival order even while a handler is still awaiting.
     */
    private async handleData(connection: Connection, chunk: Buffer) {
        const connectionId = connection.getId();
        const state = this.frameStates.get(connectionId) ?? { buffer: Buffer.alloc(0), draining: false };
        this.frameStates.set(connectionId, state);
        state.buffer = state.buffer.byteLength > 0 ? Buffer.concat([state.buffer, chunk]) : chunk;

        if (state.buffer.byteLength > MAX_RECEIVE_BUFFER) {
            this.logger.error(
                `[IN][PACKET] Receive buffer overflow (${state.buffer.byteLength} bytes) from connection: ID: ${connectionId}, closing`,
            );
            this.frameStates.delete(connectionId);
            connection.close();
            return;
        }

        if (state.draining) return;

        state.draining = true;
        try {
            while (state.buffer.byteLength > 0) {
                const frame = this.extractFrame(connection, state);
                if (!frame) break;
                await this.onData(connection, frame);
            }
        } finally {
            state.draining = false;
        }
    }

    /**
     * Cuts the next complete packet off the front of the buffer, or returns
     * null while it holds only a partial one. An unknown header means framing
     * is lost, so the buffered bytes are discarded.
     */
    private extractFrame(connection: Connection, state: FrameState): Buffer | null {
        const header = state.buffer[0];
        const packetBuilder = this.packets.get(header);

        if (!packetBuilder) {
            this.logger.info(
                `[IN][PACKET] Unknown header packet: ${header}, discarding ${state.buffer.byteLength} buffered byte(s)`,
            );
            state.buffer = Buffer.alloc(0);
            return null;
        }

        const frameLength = packetBuilder.createPacket({}).getFrameLength(state.buffer);
        if (frameLength === null) return null;

        if (frameLength < 1 || frameLength > MAX_PACKET_LENGTH) {
            this.logger.error(
                `[IN][PACKET] Invalid packet length ${frameLength} for header ${header} from connection: ID: ${connection.getId()}, closing`,
            );
            this.frameStates.delete(connection.getId());
            connection.close();
            return null;
        }

        if (state.buffer.byteLength < frameLength) return null;

        const frame = state.buffer.subarray(0, frameLength);
        state.buffer = state.buffer.subarray(frameLength);
        return frame;
    }

    async onError(connection: Connection, err: Error) {
        this.logger.debug(`[IN][ERROR SOCKET EVENT] Closing connection: ID: ${connection.getId()}`);
        this.logger.debug(`[IN][ERROR SOCKET EVENT] Error ${err.message || err}`);
        connection.setState(ConnectionStateEnum.CLOSE);
    }

    async onClose(connection: Connection) {
        this.logger.debug(`[IN][CLOSE SOCKET EVENT] Closing connection: ID: ${connection.getId()}`);
        connection.stopKeepalive();
        this.connections.delete(connection.getId());
        this.frameStates.delete(connection.getId());
    }

    start(): Promise<void> {
        return new Promise((resolve) => {
            this.server.listen(this.config.SERVER_PORT, Number(this.config.SERVER_ADDRESS), () => {
                this.logger.info(`Server running on: ${this.config.SERVER_ADDRESS}:${this.config.SERVER_PORT} 🔥 `);
                resolve();
            });
        });
    }

    async close(): Promise<void> {
        if (!this.server.listening || this.isShuttingDown) return;

        this.isShuttingDown = true;

        return new Promise((resolve, reject) => {
            this.server.close((err: Error | undefined) => {
                if (err) {
                    this.logger.error('[SERVER] Error when try to close server:', err);
                    reject(err);
                } else {
                    this.logger.info('[SERVER] Server closed with success.');
                    resolve();
                }
            });
        });
    }
}
