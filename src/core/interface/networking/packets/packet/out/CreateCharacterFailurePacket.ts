import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

type CreateCharacterFailurePacketParams = {
    reason?: number;
};

export default class CreateCharacterFailurePacket extends PacketOut {
    private reason: number;

    constructor({ reason }: CreateCharacterFailurePacketParams = {}) {
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
