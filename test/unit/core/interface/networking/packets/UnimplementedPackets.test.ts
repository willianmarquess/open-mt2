import {
    isUnimplementedHeader,
    unimplementedFrameLength,
} from '@/core/interface/networking/packets/UnimplementedPackets';
import { expect } from 'chai';

const SYNC_POSITION = 0x08;
const ELEMENT_SIZE = 12;
const FIXED_SIZE = 3;
const SEQUENCE_BYTE = 1;

const syncPosition = (elements: number) => {
    const declared = FIXED_SIZE + elements * ELEMENT_SIZE;
    const buffer = Buffer.alloc(declared + SEQUENCE_BYTE);
    buffer.writeUInt8(SYNC_POSITION, 0);
    buffer.writeUInt16LE(declared, 1);
    return buffer;
};

describe('UnimplementedPackets', function () {
    it('should recognise the client sync-position header', function () {
        expect(isUnimplementedHeader(SYNC_POSITION)).to.equal(true);
        expect(isUnimplementedHeader(0x02), 'a header we do implement').to.equal(false);
        expect(isUnimplementedHeader(0xee), 'a header nobody sends').to.equal(false);
    });

    it('should ask for more bytes while the length field is incomplete', function () {
        expect(unimplementedFrameLength(SYNC_POSITION, Buffer.alloc(FIXED_SIZE - 1))).to.equal(null);
    });

    it('should frame sync position on its declared size plus the sequence byte', function () {
        expect(unimplementedFrameLength(SYNC_POSITION, syncPosition(0))).to.equal(FIXED_SIZE + SEQUENCE_BYTE);
        expect(unimplementedFrameLength(SYNC_POSITION, syncPosition(1))).to.equal(
            FIXED_SIZE + ELEMENT_SIZE + SEQUENCE_BYTE,
        );
        expect(unimplementedFrameLength(SYNC_POSITION, syncPosition(16))).to.equal(
            FIXED_SIZE + 16 * ELEMENT_SIZE + SEQUENCE_BYTE,
        );
    });

    it('should report nothing for a header it does not carry', function () {
        expect(unimplementedFrameLength(0xee, Buffer.alloc(16))).to.equal(null);
    });
});
