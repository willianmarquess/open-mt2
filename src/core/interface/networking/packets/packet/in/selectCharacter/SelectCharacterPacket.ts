import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import SelectCharacterPacketValidator from './SelectCharacterPacketValidator';

export default class SelectCharacterPacket extends PacketIn {
    private slot: number;

    constructor({ slot }) {
        super({
            header: PacketHeaderEnum.SELECT_CHARACTER,
            name: 'SelectCharacterPacket',
            size: 2,
            validator: SelectCharacterPacketValidator,
        });
        this.slot = slot;
    }

    getSlot() {
        return this.slot;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.slot = this.bufferReader.readUInt8();
        this.validate();
        return this;
    }
}
