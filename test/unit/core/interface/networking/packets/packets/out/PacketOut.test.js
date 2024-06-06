import { expect } from 'chai';
import PacketOut from '../../../../../../../../src/core/interface/networking/packets/packet/out/PacketOut.js';
import BufferWriter from '../../../../../../../../src/core/interface/networking/buffer/BufferWriter.js';

describe('PacketOut', function () {
    let packetOut;

    beforeEach(function () {
        packetOut = new PacketOut({
            header: 0x01,
            subHeader: 0x02,
            size: 20,
            name: 'TestPacket',
        });
    });

    it('should initialize bufferWriter with correct header and size', function () {
        expect(packetOut.bufferWriter).to.be.instanceOf(BufferWriter);
        expect(packetOut.bufferWriter.buffer[0]).to.equal(0x01);
        expect(packetOut.bufferWriter.buffer.length).to.equal(20);
    });

    it('should throw error when pack method is not overwritten', function () {
        expect(() => packetOut.pack()).to.throw('this method must be overwritten');
    });

    // Create a subclass to test the pack method
    class TestPacketOut extends PacketOut {
        pack() {
            this.bufferWriter.writeUint8(0xff);
        }
    }

    it('should allow subclasses to overwrite pack method', function () {
        const testPacketOut = new TestPacketOut({
            header: 0x01,
            subHeader: 0x02,
            size: 20,
            name: 'TestPacket',
        });
        expect(() => testPacketOut.pack()).to.not.throw();
        testPacketOut.pack();
        expect(testPacketOut.bufferWriter.buffer[1]).to.equal(0xff);
    });
});
