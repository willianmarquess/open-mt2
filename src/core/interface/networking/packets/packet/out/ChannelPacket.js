import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

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
