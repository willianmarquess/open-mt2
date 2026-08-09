import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name ChatOutPacket
 * @header 0x04
 * @size 9 + message.length + 1
 * @description Is used to send a chat message to the client. This is a dynamic size packet: the 9 byte head is fixed and the message field grows with the text, so the documented sizes below are for an empty message.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {short} size 2 Total size of the packet in bytes
 *   - {byte} messageType 1 Kind of message being sent (See in ChatMessageTypeEnum)
 *   - {int} vid 4 Character identification in game of the sender
 *   - {byte} empireId 1 Id of empire
 *   - {string} message 1 Null terminated ascii message, message.length + 1 bytes wide (1 when empty)
 */

export default class ChatOutPacket extends PacketOut {
    private readonly messageType: number;
    private readonly message: string;
    private readonly vid: number;
    private readonly empireId: number;

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
