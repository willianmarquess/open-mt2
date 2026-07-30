import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import ChatInPacketValidator from './ChatInPacketValidator';

export default class ChatInPacket extends PacketIn {
    private messageType: number;
    private message: string;

    constructor({ message, messageType }: { message: string; messageType: number }) {
        super({
            header: PacketHeaderEnum.CHAT_IN,
            name: 'ChatInPacket',
            size: 4 + (message?.length ?? 0) + 1,
            validator: ChatInPacketValidator,
        });

        this.message = message;
        this.messageType = messageType;
    }

    getMessage() {
        return this.message;
    }
    getMessageType() {
        return this.messageType;
    }

    getFrameLength(buffer: Buffer): number | null {
        if (buffer.byteLength < 3) return null;
        return buffer.readUInt16LE(1) + this.getSequenceLength();
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.bufferReader.readUInt16LE();
        this.messageType = this.bufferReader.readUInt8();
        this.message = this.bufferReader.readString();
        this.validate();
        return this;
    }
}
