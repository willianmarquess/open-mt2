import { expect } from 'chai';
import sinon from 'sinon';
import MarkLoginPacket from '@/core/interface/networking/packets/packet/in/markLogin/MarkLoginPacket';
import MarkLoginPacketHandler from '@/core/interface/networking/packets/packet/in/markLogin/MarkLoginPacketHandler';
import { makePackets } from '@/core/interface/networking/packets/Packets';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';

const MARK_LOGIN_HEADER = 100;
const MARK_LOGIN_BYTES = 9;

describe('MarkLogin (issue #146)', () => {
    it('should frame at the exact wire size, with no sequence byte', () => {
        const packet = new MarkLoginPacket();

        expect(PacketHeaderEnum.MARK_LOGIN).to.be.equal(MARK_LOGIN_HEADER);
        expect(packet.getFrameLength(Buffer.alloc(MARK_LOGIN_BYTES))).to.be.equal(MARK_LOGIN_BYTES);
    });

    it('should be registered so the header is no longer unknown', () => {
        const builder = makePackets().get(MARK_LOGIN_HEADER);

        expect(builder).to.not.be.equal(undefined);
        expect(builder!.createPacket()).to.be.instanceOf(MarkLoginPacket);
        expect(builder!.createHandler({ logger: { info: () => {} } })).to.be.instanceOf(MarkLoginPacketHandler);
    });

    it('should close the connection, because this server is not a mark server', async () => {
        const logger: any = { info: sinon.spy(), error: () => {}, debug: () => {} };
        const connection: any = { getId: () => 'connection-1', close: sinon.spy() };

        await new MarkLoginPacketHandler({ logger }).execute(connection, new MarkLoginPacket());

        expect(connection.close.calledOnce).to.be.equal(true);
        expect(logger.info.calledOnce).to.be.equal(true);
    });
});
