import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name LoginSuccessPacket
 * @header 0x96
 * @size 6
 * @description Sent when the credentials are accepted, it carries the login key the client sends back on the game connection.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {int} key 4 Login key generated for this authentication, the client echoes it on the token packet.
 *   - {byte} result 1 Number which indicates the authentication result (1 means success, 0 makes the client show a key failure).
 */

export default class LoginSuccessPacket extends PacketOut {
    private readonly key: number;
    private readonly result: number;

    constructor({ key, result }: { key: number; result: number }) {
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
