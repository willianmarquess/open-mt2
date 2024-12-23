import BufferWriter from '@/core/interface/networking/buffer/BufferWriter';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';
import { expect } from 'chai';

class PacketOutTest extends PacketOut {
    pack(): Buffer {
        throw new Error('Method not implemented.');
    }

    getBufferWriter() {
        return this.bufferWriter;
    }
}

describe('PacketOut', function () {
    let packetOut: PacketOutTest;

    beforeEach(function () {
        packetOut = new PacketOutTest({
            header: 0x01,
            size: 20,
            name: 'TestPacket',
        });
    });

    it('should initialize bufferWriter with correct header and size', function () {
        expect(packetOut.getBufferWriter()).to.be.instanceOf(BufferWriter);
        expect(packetOut.getBufferWriter().getBuffer()[0]).to.equal(0x01);
        expect(packetOut.getBufferWriter().getBuffer().length).to.equal(20);
    });

    it('should throw error when pack method is not overwritten', function () {
        expect(() => packetOut.pack()).to.throw('Method not implemented.');
    });
});
