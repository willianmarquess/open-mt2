import { expect } from 'chai';
import PacketBidirectional from '../../../../../../../../src/core/interface/networking/packets/packet/bidirectional/PacketBidirectional.js';
import BufferReader from '../../../../../../../../src/core/interface/networking/buffer/BufferReader.js';
import BufferWriter from '../../../../../../../../src/core/interface/networking/buffer/BufferWriter.js';

describe('PacketBidirectional', function () {
    let packetBidirectional;

    beforeEach(function () {
        packetBidirectional = new PacketBidirectional({
            header: 0x01,
            subHeader: 0x02,
            size: 20,
            name: 'TestPacketBidirectional',
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
        expect(() => packetBidirectional.pack()).to.throw('this method must be overwritten');
    });

    it('should throw error when unpack method is not overwritten', function () {
        expect(() => packetBidirectional.unpack()).to.throw('this method must be overwritten');
    });

    class TestPacketBidirectional extends PacketBidirectional {
        pack() {
            this.bufferWriter.writeUint8(0xff);
        }

        unpack() {
            return this.bufferReader.readUInt8();
        }
    }

    it('should allow subclasses to overwrite pack method', function () {
        const testPacket = new TestPacketBidirectional({
            header: 0x01,
            subHeader: 0x02,
            size: 20,
            name: 'TestPacketBidirectional',
        });
        expect(() => testPacket.pack()).to.not.throw();
        testPacket.pack();
        expect(testPacket.bufferWriter.buffer[1]).to.equal(0xff);
    });

    it('should allow subclasses to overwrite unpack method', function () {
        const testPacket = new TestPacketBidirectional({
            header: 0x01,
            subHeader: 0x02,
            size: 20,
            name: 'TestPacketBidirectional',
        });
        const buffer = Buffer.from([0x00, 0xff]);
        testPacket.bufferReader.setBuffer(buffer, false);
        expect(() => testPacket.unpack()).to.not.throw();
        const value = testPacket.unpack();
        expect(value).to.equal(0xff);
    });
});
