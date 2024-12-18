import { createServer,Server as SocketServer, Socket } from 'node:net';
import GameConnection from '../../../game/interface/networking/GameConnection';
import Connection from '@/core/interface/networking/Connection';
import Logger from '@/core/infra/logger/Logger';
import { PacketHeaderEnum } from '@/core/enum/PacketHeaderEnum';
import { PacketMapValue } from '@/core/interface/networking/packets/Packets';
import { GameConfig } from '@/game/infra/config/GameConfig';

export default abstract class Server {
    protected server: SocketServer;
    protected readonly connections = new Map<string, Connection>();
    protected readonly logger: Logger;
    protected readonly config: GameConfig;
    protected readonly container: any;
    protected readonly packets: Map<PacketHeaderEnum, PacketMapValue<any>>;
    protected isShuttingDown = false;

    constructor(container: { logger: Logger; config: any; packets: any; }) {
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

    onListener(socket: Socket) {
        const connection = this.createConnection(socket);
        this.connections.set(connection.getId(), connection);

        this.logger.debug(`[IN][CONNECT SOCKET EVENT] New connection: ID: ${connection.getId()}`);
        connection.startHandShake();

        socket.on('close', this.onClose.bind(this, connection));
        socket.on('data', this.onData.bind(this, connection));
        socket.on('error', (err) => this.logger.error(err));
    }

    async onClose(connection: Connection) {
        this.logger.debug(`[IN][CLOSE SOCKET EVENT] Closing connection: ID: ${connection.getId()}`);
        this.connections.delete(connection.getId());
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
        this.isShuttingDown = true;

        for (const connection of this.connections.values()) {
            if (connection instanceof GameConnection) {
                await connection.saveAndDestroy();
            }
        }

        if (!this.server.listening || this.isShuttingDown) return;

        return new Promise((resolve, reject) => {
            this.server.close((err: Error) => {
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
