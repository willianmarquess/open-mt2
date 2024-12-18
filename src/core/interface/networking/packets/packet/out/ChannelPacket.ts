import { PacketHeaderEnum } from "@/core/enum/PacketHeaderEnum";
import PacketOut from "@/core/interface/networking/packets/packet/out/PacketOut"

/**
 * @packet
 * @type Out
 * @name ChannelPacket
 * @header 0x79
 * @size 2
 * @description Used to send the number of channel.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {byte} channel 1 Channel number
 */

export default class ChannelPacket extends PacketOut {
    private channel: number;

    constructor({ channel }) {
        super({
            header: PacketHeaderEnum.CHANNEL,
            name: 'ChannelPacket',
            size: 2,
        });
        this.channel = channel;
    }

    pack() {
        this.bufferWriter.writeUint8(this.channel);
        return this.bufferWriter.getBuffer();
    }
}
