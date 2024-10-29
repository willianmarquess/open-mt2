import { expect } from 'chai';
import sinon from 'sinon';
import EnterGamePacketHandler from '../../../../../../../../../src/core/interface/networking/packets/packet/in/enterGame/EnterGamePacketHandler.js';
import ConnectionStateEnum from '../../../../../../../../../src/core/enum/ConnectionStateEnum.js';
import GameTimePacket from '../../../../../../../../../src/core/interface/networking/packets/packet/out/GameTimePacket.js';
import ChannelPacket from '../../../../../../../../../src/core/interface/networking/packets/packet/out/ChannelPacket.js';

describe('EnterGamePacketHandler', function () {
    let enterGamePacketHandler, mockConnection, mockLogger, mockEnterGameService;

    beforeEach(function () {
        mockLogger = { debug: sinon.spy(), info: sinon.spy() };
        mockConnection = { send: sinon.spy(), close: sinon.spy(), id: 1, state: null, player: { id: 1 } };
        mockEnterGameService = { execute: sinon.stub().resolves() };

        enterGamePacketHandler = new EnterGamePacketHandler({
            enterGameService: mockEnterGameService,
            logger: mockLogger,
        });
    });

    afterEach(function () {
        sinon.restore();
    });

    it('should log and close connection if player is not selected', async function () {
        mockConnection.player = null;

        await enterGamePacketHandler.execute(mockConnection);

        expect(
            mockLogger.info.calledWith(
                '[EnterGamePacketHandler] The connection does not have an player select, this cannot happen',
            ),
        ).to.be.true;
        expect(mockConnection.close.calledOnce).to.be.true;
    });

    it('should set connection state to GAME', async function () {
        await enterGamePacketHandler.execute(mockConnection);

        expect(mockConnection.state).to.equal(ConnectionStateEnum.GAME);
    });

    it('should send GameTimePacket with current time', async function () {
        await enterGamePacketHandler.execute(mockConnection);

        expect(mockConnection.send.calledWith(sinon.match.instanceOf(GameTimePacket))).to.be.true;
    });

    it('should send ChannelPacket with channel 1', async function () {
        await enterGamePacketHandler.execute(mockConnection);

        expect(mockConnection.send.calledWith(sinon.match.instanceOf(ChannelPacket))).to.be.true;
    });

    it('should call enterGameService.execute with the player', async function () {
        await enterGamePacketHandler.execute(mockConnection);

        expect(mockEnterGameService.execute.calledOnceWith({ player: mockConnection.player })).to.be.true;
    });
});
