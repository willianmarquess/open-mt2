import Packet from '../Packet.js';

export default class PacketOut extends Packet {
    pack() {
        throw new Error('this method must be overwritten');
    }
}
