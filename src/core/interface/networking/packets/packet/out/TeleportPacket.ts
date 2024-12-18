import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

type TeleportPacketParams = {
    positionX?: number;
    positionY?: number;
    address?: number;
    port?: number;
};

export default class TeleportPacket extends PacketOut {
    private positionX: number;
    private positionY: number;
    private address: number;
    private port: number;

    constructor({ positionX, positionY, address, port }: TeleportPacketParams = {}) {
        super({
            header: PacketHeaderEnum.TELEPORT,
            name: 'TeleportPacket',
            size: 15,
        });
        this.positionX = positionX;
        this.positionY = positionY;
        this.address = address;
        this.port = port;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.positionX);
        this.bufferWriter.writeUint32LE(this.positionY);
        this.bufferWriter.writeUint32LE(this.address);
        this.bufferWriter.writeUint16LE(this.port);
        return this.bufferWriter.getBuffer();
    }
}
