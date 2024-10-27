import { expect } from 'chai';
import sinon from 'sinon';
import EmpirePacketHandler from '../../../../../../../../../src/core/interface/networking/packets/packet/bidirectional/empire/EmpirePacketHandler.js';
import ErrorTypesEnum from '../../../../../../../../../src/core/enum/ErrorTypesEnum.js';

describe('EmpirePacketHandler', () => {
    let selectEmpireServiceMock, loggerMock, connectionMock, packetMock, empirePacketHandler;

    beforeEach(() => {
        selectEmpireServiceMock = { execute: sinon.stub() };
        loggerMock = { error: sinon.spy(), info: sinon.spy() };
        connectionMock = { close: sinon.spy() };
        packetMock = { isValid: sinon.stub(), errors: sinon.stub() };

        empirePacketHandler = new EmpirePacketHandler({
            selectEmpireService: selectEmpireServiceMock,
            logger: loggerMock,
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should terminate the connection and register an error if packet is invalid', async () => {
        packetMock.isValid.returns(false);
        packetMock.errors.returns(['Invalid data']);

        await empirePacketHandler.execute(connectionMock, packetMock);

        expect(loggerMock.error.calledWith('[AuthTokenPacketHandler] Packet invalid')).to.be.true;
        expect(loggerMock.error.calledWith(['Invalid data'])).to.be.true;
        expect(connectionMock.close.calledOnce).to.be.true;
    });

    it('should terminate the connection if accountId not exists', async () => {
        packetMock.isValid.returns(true);
        connectionMock.accountId = null;

        await empirePacketHandler.execute(connectionMock, packetMock);

        expect(
            loggerMock.info.calledWith(
                '[EmpirePacketHandler] The connection does not have an accountId, this cannot happen',
            ),
        ).to.be.true;
        expect(connectionMock.close.calledOnce).to.be.true;
    });

    it('should terminate the connection if empire is invalid', async () => {
        packetMock.isValid.returns(true);
        packetMock.empireId = 123;
        connectionMock.accountId = 456;

        selectEmpireServiceMock.execute.resolves({
            hasError: () => true,
            error: ErrorTypesEnum.INVALID_EMPIRE,
        });

        await empirePacketHandler.execute(connectionMock, packetMock);

        expect(selectEmpireServiceMock.execute.calledOnceWith({ empireId: 123, accountId: 456 })).to.be.true;
        expect(connectionMock.close.calledOnce).to.be.true;
    });

    it('should not terminate the connection if everything is ok', async () => {
        packetMock.isValid.returns(true);
        packetMock.empireId = 123;
        connectionMock.accountId = 456;

        selectEmpireServiceMock.execute.resolves({
            hasError: () => false,
        });

        await empirePacketHandler.execute(connectionMock, packetMock);

        expect(selectEmpireServiceMock.execute.calledOnceWith({ empireId: 123, accountId: 456 })).to.be.true;
        expect(connectionMock.close.called).to.be.false;
    });
});
