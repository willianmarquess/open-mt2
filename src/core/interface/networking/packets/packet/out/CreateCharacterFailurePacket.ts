import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

export default class CreateCharacterFailurePacket extends PacketOut {
    private readonly reason: number;

    constructor({ reason }: { reason: number }) {
        super({
            header: PacketHeaderEnum.CREATE_CHARACTER_FAILURE,
            name: 'CreateCharacterFailurePacket',
            size: 2,
        });
        this.reason = reason;
    }

    pack() {
        this.bufferWriter.writeUint8(this.reason);

        return this.bufferWriter.getBuffer();
    }
}
