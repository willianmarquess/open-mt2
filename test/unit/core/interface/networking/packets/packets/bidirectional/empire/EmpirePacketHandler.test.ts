import { expect } from 'chai';
import sinon from 'sinon';
import EmpirePacketHandler from '@/core/interface/networking/packets/packet/bidirectional/empire/EmpirePacketHandler';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';

describe('EmpirePacketHandler', () => {
    let selectEmpireServiceMock, loggerMock, connectionMock, packetMock, empirePacketHandler: EmpirePacketHandler;

    beforeEach(() => {
        selectEmpireServiceMock = {
            execute: sinon.stub().resolves({
                hasError: () => false,
            }),
        };
        loggerMock = { error: sinon.spy(), info: sinon.spy() };
        connectionMock = {
            close: sinon.spy(),
            getAccountId: () => 1,
        };
        packetMock = {
            isValid: sinon.stub(),
            getErrorMessage: sinon.stub(),
            getEmpireId: () => 1,
            getAccountId: () => 1,
        };

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
        packetMock.getErrorMessage.returns(['Invalid data']);

        await empirePacketHandler.execute(connectionMock, packetMock);

        expect(loggerMock.error.calledWith('[AuthTokenPacketHandler] Packet invalid')).to.be.true;
        expect(loggerMock.error.calledWith(['Invalid data'])).to.be.true;
        expect(connectionMock.close.calledOnce).to.be.true;
    });

    it('should terminate the connection if accountId not exists', async () => {
        packetMock.isValid.returns(true);
        connectionMock.getAccountId = () => null;

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
        packetMock.getEmpireId = () => 123;
        connectionMock.getAccountId = () => 456;

        selectEmpireServiceMock.execute.resolves({
            hasError: () => true,
            getError: () => ErrorTypesEnum.INVALID_EMPIRE,
        });

        await empirePacketHandler.execute(connectionMock, packetMock);

        expect(selectEmpireServiceMock.execute.calledOnceWith(123, 456)).to.be.true;
        expect(connectionMock.close.calledOnce).to.be.true;
    });

    it('should not terminate the connection if everything is ok', async () => {
        packetMock.isValid.returns(true);
        packetMock.getEmpireId = () => 123;
        connectionMock.getAccountId = () => 456;

        selectEmpireServiceMock.execute.resolves({
            hasError: () => false,
        });

        await empirePacketHandler.execute(connectionMock, packetMock);

        expect(selectEmpireServiceMock.execute.calledOnceWith(123, 456)).to.be.true;
        expect(connectionMock.close.called).to.be.false;
    });
});
