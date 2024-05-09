import Packet from '../Packet.js';

export default class PacketBidirectional extends Packet {
    pack() {
        throw new Error('this method must be overwritten');
    }

    static unpack() {
        throw new Error('this method must be overwritten');
    }
}
