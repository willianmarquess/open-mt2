import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name StunPacket
 * @header 0x0d
 * @size 5
 * @description Marks a character as stunned. For a non-main vid the client stops the actor and attaches the stun effect without playing any motion and without marking it dead, so the actor stays clickable.
 * @fields
 *   - {byte} header 1 Packet header.
 *   - {int} vid 4 Character identification in game.
 */

export default class StunPacket extends PacketOut {
    private readonly vid: number;

    constructor({ vid }: { vid: number }) {
        super({
            header: PacketHeaderEnum.STUN,
            name: 'StunPacket',
            size: 5,
        });
        this.vid = vid;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.vid);
        return this.bufferWriter.getBuffer();
    }
}
