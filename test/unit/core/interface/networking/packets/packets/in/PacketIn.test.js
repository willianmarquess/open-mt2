import { expect } from 'chai';
import PacketIn from '../../../../../../../../src/core/interface/networking/packets/packet/in/PacketIn';
import BufferReader from '../../../../../../../../src/core/interface/networking/buffer/BufferReader';

describe('PacketIn', function () {
    let packetIn;

    beforeEach(function () {
        packetIn = new PacketIn({});
    });

    it('should initialize bufferReader', function () {
        expect(packetIn.bufferReader).to.be.instanceOf(BufferReader);
    });

    it('should throw error when unpack method is not overwritten', function () {
        expect(() => packetIn.unpack()).to.throw('this method must be overwritten');
    });

    class TestPacket extends PacketIn {
        unpack() {
            return 'unpacked';
        }
    }

    it('should allow subclasses to overwrite unpack method', function () {
        const testPacket = new TestPacket({});
        expect(() => testPacket.unpack()).to.not.throw();
        expect(testPacket.unpack()).to.equal('unpacked');
    });

    it('should allow setting buffer in bufferReader', function () {
        const buffer = Buffer.from([0x01, 0x02, 0x03, 0x04]);
        packetIn.bufferReader.setBuffer(buffer, false);
        expect(packetIn.bufferReader.readUInt8()).to.equal(0x01);
        expect(packetIn.bufferReader.readUInt8()).to.equal(0x02);
        expect(packetIn.bufferReader.readUInt8()).to.equal(0x03);
        expect(packetIn.bufferReader.readUInt8()).to.equal(0x04);
    });
});
