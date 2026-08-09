import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name RemoveCharacterPacket
 * @header 0x02
 * @size 5
 * @description Is used to despawn a character (player, mob, npc) from the client of nearby players.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {int} vid 4 Character identification in game
 */

export default class RemoveCharacterPacket extends PacketOut {
    private readonly vid: number;

    constructor({ vid }: { vid: number }) {
        super({
            header: PacketHeaderEnum.CHARACTER_REMOVE,
            name: 'RemoveCharacterPacket',
            size: 5,
        });
        this.vid = vid;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.vid);
        return this.bufferWriter.getBuffer();
    }
}
