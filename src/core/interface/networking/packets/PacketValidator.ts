import FluentValidator from '@/core/infra/validation/FluentValidator';
import Packet from '@/core/interface/networking/packets/packet/Packet';

export default class PacketValidator<T extends Packet> extends FluentValidator {
    protected packet: T;

    constructor(packet: T) {
        super();
        this.packet = packet;
    }

    setPacket(value: T) {
        if (!(value instanceof Packet)) throw new Error('Packet must be an instance of Packet base class');
        this.packet = value;
    }

    getPacket() {
        return this.packet;
    }

    build() {
        throw new Error('Build method must be overridden');
    }
}
