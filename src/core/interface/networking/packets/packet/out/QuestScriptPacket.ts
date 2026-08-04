import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

type QuestScriptPacketParams = {
    skin: number;
    src: string;
};

/**
 * @packet
 * @type Out
 * @name QuestScriptPacket
 * @header 0x2d
 * @size 6 + srcSize
 * @description Used to send a quest script (the text and buttons of a quest dialog) to the client. The size is dynamic: a fixed 6 byte head followed by srcSize raw script bytes, so the packet is 6 + srcSize bytes. The script is not zero terminated on the wire, the client appends the terminator itself.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {short} size 2 Total size in bytes of this packet (6 + srcSize)
 *   - {byte} skin 1 Quest dialog skin the client should render with
 *   - {short} srcSize 2 Length in bytes of the script that follows
 *   - {string} src 0 Quest script source. Variable length, srcSize bytes, so no fixed width applies.
 */

export default class QuestScriptPacket extends PacketOut {
    private readonly totalSize: number;
    private readonly skin: number;
    private readonly src_size: number;
    private readonly src: string;

    constructor({ skin, src }: QuestScriptPacketParams) {
        const totalSize = 1 + 2 + 1 + 2 + src.length;

        super({
            header: PacketHeaderEnum.QUEST_SCRIPT,
            name: 'QuestScriptPacket',
            size: totalSize,
        });

        this.skin = skin;
        this.src_size = src.length;
        this.totalSize = totalSize;
        this.src = src;
    }

    pack() {
        this.bufferWriter.writeUint16LE(this.totalSize);
        this.bufferWriter.writeUint8(this.skin);
        this.bufferWriter.writeUint16LE(this.src_size);
        this.bufferWriter.writeString(this.src, this.src_size + 1);
        return this.bufferWriter.getBuffer();
    }
}
