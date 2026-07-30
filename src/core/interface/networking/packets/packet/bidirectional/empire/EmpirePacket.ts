import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketBidirectional from '../PacketBidirectional';
import EmpirePacketValidator from './EmpirePacketValidator';

export default class EmpirePacket extends PacketBidirectional {
    private empireId: number;

    constructor({ empireId }: { empireId: number }) {
        super({
            header: PacketHeaderEnum.EMPIRE,
            name: 'EmpirePacket',
            size: 3,
            validator: EmpirePacketValidator,
        });
        this.empireId = empireId;
    }

    getEmpireId() {
        return this.empireId;
    }

    // The declared size (3) sizes the outgoing buffer; inbound is header + empire.
    getFrameLength(): number | null {
        return 2 + this.getSequenceLength();
    }

    pack() {
        this.bufferWriter.writeUint8(this.empireId).writeUint8(0);
        return this.bufferWriter.getBuffer();
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.empireId = this.bufferReader.readUInt8();
        this.validate();
        return this;
    }
}
