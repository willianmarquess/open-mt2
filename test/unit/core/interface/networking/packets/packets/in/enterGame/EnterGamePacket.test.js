import { expect } from 'chai';
import PacketHeaderEnum from '../../../../../../../../../src/core/enum/PacketHeaderEnum.js';
import EnterGamePacket from '../../../../../../../../../src/core/interface/networking/packets/packet/in/enterGame/EnterGamePacket.js';

describe('EnterGamePacket', function () {
    let enterGamePacket;

    beforeEach(function () {
        enterGamePacket = new EnterGamePacket();
    });

    it('should initialize with correct header, name, and size', function () {
        expect(enterGamePacket.header).to.equal(PacketHeaderEnum.ENTER_GAME);
        expect(enterGamePacket.name).to.equal('EnterGamePacket');
        expect(enterGamePacket.size).to.equal(0);
    });

    it('should unpack correctly', function () {
        const buffer = Buffer.alloc(0); // No data is expected
        const unpackedPacket = enterGamePacket.unpack(buffer);

        expect(unpackedPacket).to.be.an.instanceof(EnterGamePacket);
    });
});
