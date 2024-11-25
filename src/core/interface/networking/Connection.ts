import { randomBytes, randomUUID, UUID } from "crypto";
import ConnectionStatePacket from "./packets/packet/out/ConnectionStatePacket.js";
import ConnectionStateEnum from "../../enum/ConnectionStateEnum.js";
import HandshakePacket from "./packets/packet/bidirectional/handshake/HandshakePacket.js";
import { Logger } from "winston";

export default abstract class Connection {
  private id: UUID;
  protected state: number | null = null;
  protected socket: any;
  protected logger: Logger;
  private lastHandshake: any;

  constructor(socket: any, logger: Logger) {
    this.id = randomUUID();
    this.socket = socket;
    this.logger = logger;
  }

  abstract onHandshakeSuccess(): void;

  abstract send(packet: any): void;

  setLastHandshake(value: any) {
    this.lastHandshake = value;
  }

  setSate(value: any) {
    this.logger.debug(`Connection state changing from ${this.state} to ${value}`);
    this.state = value;
    this.updateState();
  }

  private updateState() {
    const packet = new ConnectionStatePacket({ state: this.state });
    this.send(packet);
  }

  startHandShake() {
    this.state = ConnectionStateEnum.HANDSHAKE;
    const id = randomBytes(4).readUInt32LE();
    const handshake = new HandshakePacket(id, performance.now(), 0);
    this.lastHandshake = handshake;
    this.send(handshake);
  }

  close() {
    this.socket.destroy();
  }
}
