import { expect } from 'chai';
import BufferReader from '@/core/interface/networking/buffer/BufferReader';
import PacketIn from '@/core/interface/networking/packets/packet/in/PacketIn';

class PacketInTest extends PacketIn {
    unpack(): this {
        throw new Error('Method not implemented.');
    }
}

describe('PacketIn', function () {
    let packetIn;

    beforeEach(function () {
        packetIn = new PacketInTest({
            header: 1,
            name: 'name',
            size: 1,
        });
    });

    it('should initialize bufferReader', function () {
        expect(packetIn.bufferReader).to.be.instanceOf(BufferReader);
    });

    it('should throw error when unpack method is not overwritten', function () {
        expect(() => packetIn.unpack()).to.throw('Method not implemented.');
    });
});
