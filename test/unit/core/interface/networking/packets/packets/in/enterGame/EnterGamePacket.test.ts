import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import EnterGamePacket from '@/core/interface/networking/packets/packet/in/enterGame/EnterGamePacket';
import { expect } from 'chai';

describe('EnterGamePacket', function () {
    let enterGamePacket: EnterGamePacket;

    beforeEach(function () {
        enterGamePacket = new EnterGamePacket();
    });

    it('should initialize with correct header, name, and size', function () {
        expect(enterGamePacket.getHeader()).to.equal(PacketHeaderEnum.ENTER_GAME);
        expect(enterGamePacket.getName()).to.equal('EnterGamePacket');
        expect(enterGamePacket.getSize()).to.equal(0);
    });

    it('should unpack correctly', function () {
        const unpackedPacket = enterGamePacket.unpack();

        expect(unpackedPacket).to.be.an.instanceof(EnterGamePacket);
    });
});
