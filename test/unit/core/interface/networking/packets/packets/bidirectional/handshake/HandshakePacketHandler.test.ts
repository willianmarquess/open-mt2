import { expect } from 'chai';
import sinon from 'sinon';
import HandshakePacketHandler from '@/core/interface/networking/packets/packet/bidirectional/handshake/HandshakePacketHandler';
import HandshakePacket from '@/core/interface/networking/packets/packet/bidirectional/handshake/HandshakePacket';

describe('HandshakePacketHandler', () => {
    let loggerMock, connectionMock, packetMock, handshakePacketHandler: HandshakePacketHandler;

    beforeEach(() => {
        loggerMock = { error: sinon.spy(), info: sinon.spy() };
        connectionMock = {
            close: sinon.spy(),
            onHandshakeSuccess: sinon.spy(),
            send: sinon.spy(),
            getLastHandshake: () => ({ getId: () => 123, getTime: () => 1000 }),
            setLastHandshake: () => {},
        };
        packetMock = {
            isValid: sinon.stub(),
            getId: () => 123,
            getTime: () => 1000,
            getDelta: () => 10,
            getErrorMessage: () => ['Invalid packet data'],
        };

        handshakePacketHandler = new HandshakePacketHandler({ logger: loggerMock });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should close the connection and log an error if the packet is invalid', async () => {
        packetMock.isValid.returns(false);

        await handshakePacketHandler.execute(connectionMock, packetMock);

        expect(loggerMock.error.calledWith('[AuthTokenPacketHandler] Packet invalid')).to.be.true;
        expect(loggerMock.error.calledWith(['Invalid packet data'])).to.be.true;
        expect(connectionMock.close.calledOnce).to.be.true;
    });

    it('should close the connection if packet ID does not match the last handshake ID', async () => {
        packetMock.isValid.returns(true);
        packetMock.getId = () => 999;

        await handshakePacketHandler.execute(connectionMock, packetMock);

        expect(loggerMock.info.calledWith('[HANDSHAKE] A different package was received than the one sent..')).to.be
            .true;
        expect(loggerMock.info.calledWith('[HANDSHAKE] Send close connection..')).to.be.true;
        expect(connectionMock.close.calledOnce).to.be.true;
    });

    it('should confirm handshake success if server and client are synchronized within delta range', async () => {
        packetMock.isValid.returns(true);
        sinon.stub(global, 'performance').value({ now: () => packetMock.getTime() + packetMock.getDelta() + 20 });

        await handshakePacketHandler.execute(connectionMock, packetMock);

        expect(loggerMock.info.calledWithMatch('[HANDSHAKE] Server and client is synchronized enough')).to.be.true;
        expect(connectionMock.onHandshakeSuccess.calledOnce).to.be.true;
        expect(connectionMock.close.called).to.be.false;
    });

    it('should resend handshake if synchronization delta is outside allowed range', async () => {
        packetMock.isValid.returns(true);
        sinon.stub(global, 'performance').value({ now: () => packetMock.getTime() + packetMock.getDelta() + 600 });

        await handshakePacketHandler.execute(connectionMock, packetMock);

        expect(loggerMock.info.calledWithMatch('[HANDSHAKE] Is not synchronized enough')).to.be.true;
        expect(connectionMock.onHandshakeSuccess.called).to.be.false;
        expect(connectionMock.close.called).to.be.false;
        expect(connectionMock.send.calledOnce).to.be.true;

        const sentHandshake = connectionMock.send.firstCall.args[0];
        expect(sentHandshake).to.be.instanceOf(HandshakePacket);
        expect(sentHandshake.getId()).to.equal(packetMock.getId());
    });

    it('should recalculate delta if the new delta is below 0', async () => {
        packetMock.isValid.returns(true);
        sinon.stub(global, 'performance').value({ now: () => packetMock.getTime() - 20 });

        await handshakePacketHandler.execute(connectionMock, packetMock);

        expect(loggerMock.info.calledWithMatch('[HANDSHAKE] Is too low')).to.be.true;
        expect(connectionMock.send.calledOnce).to.be.true;

        const sentHandshake = connectionMock.send.firstCall.args[0];
        expect(sentHandshake).to.be.instanceOf(HandshakePacket);
        expect(sentHandshake.getId()).to.equal(packetMock.getId());
    });
});
