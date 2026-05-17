import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

export default class ChatOutPacket extends PacketOut {
    private messageType: number;
    private message: string;
    private vid: number;
    private empireId: number;

    constructor({
        messageType,
        vid,
        empireId,
        message = '',
    }: {
        messageType: number;
        vid: number;
        empireId: number;
        message?: string;
    }) {
        super({
            header: PacketHeaderEnum.CHAT_OUT,
            name: 'ChatOutPacket',
            size: 9 + message.length + 1,
        });
        this.messageType = messageType;
        this.message = message;
        this.vid = vid;
        this.empireId = empireId;
    }

    pack() {
        this.bufferWriter.writeUint16LE(this.size);
        this.bufferWriter.writeUint8(this.messageType);
        this.bufferWriter.writeUint32LE(this.vid);
        this.bufferWriter.writeUint8(this.empireId);
        this.bufferWriter.writeString(this.message, this.message.length + 1);
        return this.bufferWriter.getBuffer();
    }
}
