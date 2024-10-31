import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

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
    #channel;

    constructor({ channel } = {}) {
        super({
            header: PacketHeaderEnum.CHANNEL,
            name: 'ChannelPacket',
            size: 2,
        });
        this.#channel = channel;
    }

    pack() {
        this.bufferWriter.writeUint8(this.#channel);
        return this.bufferWriter.buffer;
    }
}
