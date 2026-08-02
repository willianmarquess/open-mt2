import { expect } from 'chai';
import sinon from 'sinon';
import ChatInPacketHandler from '@/core/interface/networking/packets/packet/in/chat/ChatInPacketHandler';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

describe('ChatInPacketHandler', () => {
    let loggerMock, commandManagerMock, connectionMock, packetMock, playerMock;
    let chatInPacketHandler: ChatInPacketHandler;

    beforeEach(() => {
        loggerMock = {
            error: sinon.spy(),
            info: sinon.spy(),
            debug: sinon.spy(),
        };

        commandManagerMock = {
            execute: sinon.stub(),
        };

        playerMock = {
            getName: () => 'TestPlayer',
            chat: sinon.spy(),
            isChatAllowed: sinon.stub().returns(true),
            hasShoutLevel: sinon.stub().returns(true),
            getShoutMinLevel: () => 15,
            isShoutAllowed: sinon.stub().returns(true),
        };

        connectionMock = {
            close: sinon.spy(),
            getPlayer: () => playerMock,
        };

        packetMock = {
            isValid: sinon.stub().returns(true),
            getErrorMessage: () => sinon.stub(),
            getMessage: () => '/item 27001 1',
            getMessageType: () => ChatMessageTypeEnum.NORMAL,
        };

        chatInPacketHandler = new ChatInPacketHandler({
            logger: loggerMock,
            commandManager: commandManagerMock,
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should run a command when the player is within the chat rate limit', async () => {
        await chatInPacketHandler.execute(connectionMock, packetMock);

        expect(commandManagerMock.execute.calledOnce).to.be.true;
    });

    it('should drop the message when the player is flooding, commands included (issue #67)', async () => {
        playerMock.isChatAllowed.returns(false);

        await chatInPacketHandler.execute(connectionMock, packetMock);

        expect(commandManagerMock.execute.called, 'the command never ran').to.be.false;
        expect(connectionMock.close.called, 'the connection stays open').to.be.false;
    });

    it('should refuse a shout below the minimum level and say why (issue #67)', async () => {
        packetMock.getMessageType = () => ChatMessageTypeEnum.SHOUT;
        playerMock.hasShoutLevel.returns(false);

        await chatInPacketHandler.execute(connectionMock, packetMock);

        expect(
            playerMock.chat.calledOnceWith({
                messageType: ChatMessageTypeEnum.INFO,
                message: '[SYSTEM] You must be at least level 15 to shout',
            }),
        ).to.be.true;
        expect(playerMock.isShoutAllowed.called, 'the cooldown is not consumed').to.be.false;
    });

    it('should drop a shout that is still on cooldown, without a message (issue #67)', async () => {
        packetMock.getMessageType = () => ChatMessageTypeEnum.SHOUT;
        playerMock.isShoutAllowed.returns(false);

        await chatInPacketHandler.execute(connectionMock, packetMock);

        expect(playerMock.chat.called, 'the original stays silent on the cooldown').to.be.false;
    });

    it('should log an error and close the connection if the packet is invalid', async () => {
        packetMock.isValid.returns(false);
        packetMock.getErrorMessage = () => ['Invalid packet format'];

        await chatInPacketHandler.execute(connectionMock, packetMock);

        expect(loggerMock.error.calledWith('[ChatInPacketHandler] Packet invalid')).to.be.true;
        expect(connectionMock.close.calledOnce).to.be.true;
    });
});
