import { expect } from 'chai';
import sinon from 'sinon';
import ClientVersionPacketHandler from '../../../../../../../../../src/core/interface/networking/packets/packet/in/clientVersion/ClientVersionPacketHandler.js';

describe('ClientVersionPacketHandler', () => {
    let loggerMock, connectionMock, packetMock;
    let clientVersionPacketHandler;

    beforeEach(() => {
        loggerMock = {
            info: sinon.spy(),
        };

        connectionMock = {
            id: 'test-connection-id',
        };

        packetMock = {
            clientName: 'TestClient',
            timeStamp: 123456789,
        };

        clientVersionPacketHandler = new ClientVersionPacketHandler({ logger: loggerMock });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should log the client version information correctly', async () => {
        await clientVersionPacketHandler.execute(connectionMock, packetMock);

        expect(
            loggerMock.info.calledWith(
                `[ClientVersionPacketHandler] Client version received, id: test-connection-id, clientName: TestClient, timestamp: 123456789`,
            ),
        ).to.be.true;
    });
});
