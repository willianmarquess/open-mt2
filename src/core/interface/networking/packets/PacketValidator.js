import FluentValidator from '../../../infra/validation/FluentValidator.js';
import Packet from './packet/Packet.js';

export default class PacketValidator extends FluentValidator {
    #packet;

    constructor(packet) {
        super();
        this.packet = packet;
    }

    set packet(value) {
        if (!(value instanceof Packet)) throw new Error('Packet must be an instance of Packet base class');
        this.#packet = value;
    }

    get packet() {
        return this.#packet;
    }

    build() {
        throw new Error('Build method must be overridden');
    }
}
