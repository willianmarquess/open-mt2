import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

export default class GameTimePacket extends PacketOut {
    private time: number;

    constructor({ time }: { time: number }) {
        super({
            header: PacketHeaderEnum.GAME_TIME,
            name: 'GameTimePacket',
            size: 5,
        });
        this.time = time;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.time);
        return this.bufferWriter.getBuffer();
    }
}
