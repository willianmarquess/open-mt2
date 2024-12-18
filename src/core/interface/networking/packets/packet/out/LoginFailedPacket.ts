import { PacketHeaderEnum } from "@/core/enum/PacketHeaderEnum";
import PacketOut from "@/core/interface/networking/packets/packet/out/PacketOut"

type LoginFailedPacketParams = {
    status?: string
}

export default class LoginFailedPacket extends PacketOut {
    private status: string;

    constructor({ status }: LoginFailedPacketParams = {}) {
        super({
            header: PacketHeaderEnum.LOGIN_FAILED,
            name: 'LoginFailedPacket',
            size: 10,
        });
        this.status = status;
    }

    pack() {
        this.bufferWriter.writeString(this.status, this.status.length + 1);
        return this.bufferWriter.getBuffer();
    }
}
