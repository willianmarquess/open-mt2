import { expect } from 'chai';
import BufferReader from '@/core/interface/networking/buffer/BufferReader';
import BufferWriter from '@/core/interface/networking/buffer/BufferWriter';
import PacketBidirectional from '@/core/interface/networking/packets/packet/bidirectional/PacketBidirectional';

class PacketBidirectionalTest extends PacketBidirectional {
    pack() {
        throw new Error('Method not implemented.');
    }
    unpack() {
        throw new Error('Method not implemented.');
    }
}

describe('PacketBidirectional', function () {
    let packetBidirectional;

    beforeEach(function () {
        packetBidirectional = new PacketBidirectionalTest({
            header: 0x01,
            name: 'name',
            size: 20,
            validator: undefined,
        });
    });

    it('should initialize bufferWriter with correct header and size', function () {
        expect(packetBidirectional.bufferWriter).to.be.instanceOf(BufferWriter);
        expect(packetBidirectional.bufferWriter.buffer[0]).to.equal(0x01);
        expect(packetBidirectional.bufferWriter.buffer.length).to.equal(20);
    });

    it('should initialize bufferReader correctly', function () {
        expect(packetBidirectional.bufferReader).to.be.instanceOf(BufferReader);
    });

    it('should throw error when pack method is not overwritten', function () {
        expect(() => packetBidirectional.pack()).to.throw('Method not implemented.');
    });

    it('should throw error when unpack method is not overwritten', function () {
        expect(() => packetBidirectional.unpack()).to.throw('Method not implemented.');
    });
});
