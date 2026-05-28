import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

export default class RemoveCharacterPacket extends PacketOut {
    private vid: number;

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
