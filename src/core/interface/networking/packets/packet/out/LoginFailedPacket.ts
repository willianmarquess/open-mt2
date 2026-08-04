import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name LoginFailedPacket
 * @header 0x07
 * @size 10
 * @description Sent when the credentials are refused, the status text is the key the client uses to pick the error message (See LoginStatusEnum).
 * @fields
 *   - {byte} header 1 Packet header
 *   - {string} status 9 Status text, null terminated and zero padded, max 8 ascii characters (ex: WRONGPWD, ALREADY).
 */

export default class LoginFailedPacket extends PacketOut {
    private readonly status: string;

    constructor({ status }: { status: string }) {
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
