import Packet from '../Packet.js';

export default class PacketIn extends Packet {
    static unpack() {
        throw new Error('this method must be overwritten');
    }
}
