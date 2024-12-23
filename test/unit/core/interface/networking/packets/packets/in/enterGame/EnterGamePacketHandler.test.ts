import { expect } from 'chai';
import sinon from 'sinon';
import { ConnectionStateEnum } from '@/core/enum/ConnectionStateEnum';
import EnterGamePacketHandler from '@/core/interface/networking/packets/packet/in/enterGame/EnterGamePacketHandler';
import ChannelPacket from '@/core/interface/networking/packets/packet/out/ChannelPacket';
import GameTimePacket from '@/core/interface/networking/packets/packet/out/GameTimePacket';

describe('EnterGamePacketHandler', function () {
    let enterGamePacketHandler: EnterGamePacketHandler, mockConnection, mockLogger, mockEnterGameService;

    beforeEach(function () {
        mockLogger = { debug: sinon.spy(), info: sinon.spy() };
        mockConnection = {
            state: 0,
            send: sinon.spy(),
            close: sinon.spy(),
            getId: () => 1,
            getState: () => this.state,
            getPlayer: () => ({ id: 1 }),
            setState: (value) => {
                this.state = value;
            },
        };
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
        mockConnection.getPlayer = () => null;

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

        expect(mockConnection.getState()).to.equal(ConnectionStateEnum.GAME);
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
        expect(mockEnterGameService.execute.calledOnceWith(mockConnection.getPlayer())).to.be.true;
    });
});
