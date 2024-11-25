import Server from "../../../core/interface/server/Server.js";
import Queue from "../../../core/util/Queue.js";
import GameConnection from "../networking/GameConnection.js";

const INCOMING_MESSAGES_QUEUE_SIZE = 100000;

export default class GameServer extends Server {
  #incomingMessages = new Queue(INCOMING_MESSAGES_QUEUE_SIZE);
  #logoutService;

  constructor(container) {
    super(container);
    this.#logoutService = container.logoutService;
  }

  async onData(connection, data) {
    this.container.containerInstance.createScope();
    this.logger.debug(`[IN][DATA SOCKET EVENT] Data received from socket connection with id ${connection.id}`);
    this.logger.debug(`[IN][DATA SOCKET EVENT] Data: ${data.toString("hex")}`);
    const header = data[0];
    this.logger.debug(`[IN][DATA SOCKET EVENT] Header: ${header}`);
    const packetExists = this.packets.has(header);
    if (!packetExists) {
      this.logger.debug(`[IN][PACKET] Unknow header packet: ${data[0]}`);
      return;
    }
    const { createPacket, createHandler } = this.packets.get(header);
    const packet = createPacket();
    const handler = createHandler(this.container);
    this.#incomingMessages.enqueue({
      packet: packet.unpack(data),
      handler,
      connection,
    });
  }

  processMessages() {
    for (const { packet, handler, connection } of this.#incomingMessages.dequeueIterator()) {
      this.logger.debug(`[IN][PACKET] processing packet: ${handler.constructor.name}`);
      handler.execute(connection, packet).catch((err) => this.logger.error(err));
    }
  }

  sendPendingMessages() {
    for (const connection of this.connections.values()) {
      connection.sendPendingMessages().catch((err) => this.logger.error(err));
    }
  }

  createConnection(socket) {
    return new GameConnection({
      socket,
      logger: this.logger,
      packets: this.packets,
      logoutService: this.#logoutService,
      config: this.config,
    });
  }

  async onClose(connection) {
    super.onClose(connection);
    await connection.onClose();
  }
}
