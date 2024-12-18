import { PacketHeaderEnum } from "@/core/enum/PacketHeaderEnum";
import PacketOut from "@/core/interface/networking/packets/packet/out/PacketOut"

type LoginSuccessPacketParams = {
    key?: number,
    result?: number
}

export default class LoginSuccessPacket extends PacketOut {
    private key: number;
    private result: number;

    constructor({ key, result }: LoginSuccessPacketParams = {}) {
        super({
            header: PacketHeaderEnum.LOGIN_SUCCESS,
            name: 'LoginSuccessPacket',
            size: 6,
        });
        this.key = key;
        this.result = result;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.key);
        this.bufferWriter.writeUint8(this.result);
        return this.bufferWriter.getBuffer();
    }
}
