import AuthConnection from "../networking/AuthConnection.js";
import Server from "../../../core/interface/server/Server.js";
import Connection from "../../../core/interface/networking/Connection.js";

export default class AuthServer extends Server {
  async onData(connection: Connection, data: any) {
    this.container.containerInstance.createScope();
    this.logger.debug(`[IN][DATA SOCKET EVENT] Data received from ID: ${connection.id}`);
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
    this.logger.debug(`[IN][PACKET] name: ${handler.constructor.name}`);
    handler.execute(connection, packet.unpack(data)).catch((err) => this.logger.error(err));
  }

  createConnection(socket: any) {
    return new AuthConnection({
      socket,
      logger: this.logger,
      packets: this.packets,
    });
  }
}
