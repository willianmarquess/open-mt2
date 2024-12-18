import { PacketHeaderEnum } from "@/core/enum/PacketHeaderEnum";
import PacketIn from "../PacketIn";
import ChatInPacketValidator from "./ChatInPacketValidator";

export default class ChatInPacket extends PacketIn {
    private messageType: number;
    private message: string;

    constructor({ message, messageType }) {
        super({
            header: PacketHeaderEnum.CHAT_IN,
            name: 'ChatInPacket',
            size: 5 + message?.length + 1,
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

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.bufferReader.readUInt16LE();
        this.messageType = this.bufferReader.readUInt8();
        this.message = this.bufferReader.readString();
        this.validate();
        return this;
    }
}
