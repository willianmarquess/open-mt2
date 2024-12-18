import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

type RemoveCharacterPacketParams = {
    vid?: number;
};

export default class RemoveCharacterPacket extends PacketOut {
    private vid: number;

    constructor({ vid }: RemoveCharacterPacketParams = {}) {
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
