import { PacketHeaderEnum } from "@/core/enum/PacketHeaderEnum";
import PacketOut from "@/core/interface/networking/packets/packet/out/PacketOut"

type ServerStatusPacketParams = {
    status?: Array<{
        port: number,
        status: number
    }>,
    isSuccess?: boolean
}

export default class ServerStatusPacket extends PacketOut {
    private status: Array<{
        port: number,
        status: number
    }>;
    private isSuccess: number;

    constructor({
        status = [
            {
                port: 0,
                status: 1,
            },
        ],
        isSuccess = true,
    }: ServerStatusPacketParams = {}) {
        super({
            header: PacketHeaderEnum.SERVER_STATUS,
            name: 'ServerStatusPacket',
            size: 9, //fixed for now
        });
        this.status = status;
        this.isSuccess = isSuccess ? 1 : 0;
    }

    calcSize() {
        return 6 + this.status.length * 3;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.calcSize());
        this.status.forEach((s) => {
            this.bufferWriter.writeUint16LE(s.port).writeUint8(s.status);
        });
        this.bufferWriter.writeUint8(this.isSuccess);
        return this.bufferWriter.getBuffer();
    }
}
