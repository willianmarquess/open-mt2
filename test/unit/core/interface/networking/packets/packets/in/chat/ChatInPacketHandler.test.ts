import { expect } from 'chai';
import sinon from 'sinon';
import ChatInPacketHandler from '@/core/interface/networking/packets/packet/in/chat/ChatInPacketHandler';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

describe('ChatInPacketHandler', () => {
    let loggerMock, commandManagerMock, chatServiceMock, connectionMock, packetMock, playerMock;
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

        chatServiceMock = {
            talk: sinon.spy(),
            shout: sinon.spy(),
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
            chatService: chatServiceMock,
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

    it('should surface a failing command instead of leaking its rejection to the process (issue #155)', async () => {
        const failure = new Error('command handler blew up');
        commandManagerMock.execute.rejects(failure);

        let rejection: unknown = null;
        await chatInPacketHandler.execute(connectionMock, packetMock).catch((error) => (rejection = error));

        expect(rejection, 'GameServer.onData can only log a rejection the handler awaited').to.equal(failure);
    });

    it('should broadcast an ordinary message instead of dropping it (issue #56)', async () => {
        packetMock.getMessage = () => 'hello there';

        await chatInPacketHandler.execute(connectionMock, packetMock);

        expect(chatServiceMock.talk.calledOnceWith(playerMock, 'hello there')).to.be.true;
        expect(commandManagerMock.execute.called, 'a plain message is not a command').to.be.false;
    });

    it('should never broadcast a command, which would publish it to the whole map (issue #56)', async () => {
        await chatInPacketHandler.execute(connectionMock, packetMock);

        expect(commandManagerMock.execute.calledOnce).to.be.true;
        expect(chatServiceMock.talk.called, 'the command text stays private').to.be.false;
    });

    it('should treat a lone slash as chat, the way the original does', async () => {
        packetMock.getMessage = () => '/';

        await chatInPacketHandler.execute(connectionMock, packetMock);

        expect(commandManagerMock.execute.called).to.be.false;
        expect(chatServiceMock.talk.calledOnceWith(playerMock, '/')).to.be.true;
    });

    it('should send a shout to the empire once it passes both gates (issue #56)', async () => {
        packetMock.getMessageType = () => ChatMessageTypeEnum.SHOUT;
        packetMock.getMessage = () => 'trading here';

        await chatInPacketHandler.execute(connectionMock, packetMock);

        expect(chatServiceMock.shout.calledOnceWith(playerMock, 'trading here')).to.be.true;
    });

    it('should not shout for a player below the minimum level', async () => {
        packetMock.getMessageType = () => ChatMessageTypeEnum.SHOUT;
        playerMock.hasShoutLevel.returns(false);

        await chatInPacketHandler.execute(connectionMock, packetMock);

        expect(chatServiceMock.shout.called).to.be.false;
    });

    it('should not shout while the cooldown is running', async () => {
        packetMock.getMessageType = () => ChatMessageTypeEnum.SHOUT;
        playerMock.isShoutAllowed.returns(false);

        await chatInPacketHandler.execute(connectionMock, packetMock);

        expect(chatServiceMock.shout.called).to.be.false;
    });

    it('should answer party and guild chat the way the original answers a player in neither', async () => {
        packetMock.getMessageType = () => ChatMessageTypeEnum.GROUP;
        await chatInPacketHandler.execute(connectionMock, packetMock);

        packetMock.getMessageType = () => ChatMessageTypeEnum.GUILD;
        await chatInPacketHandler.execute(connectionMock, packetMock);

        expect(playerMock.chat.getCall(0).args[0]).to.deep.equal({
            messageType: ChatMessageTypeEnum.INFO,
            message: '[SYSTEM] You are not in a party',
        });
        expect(playerMock.chat.getCall(1).args[0]).to.deep.equal({
            messageType: ChatMessageTypeEnum.INFO,
            message: '[SYSTEM] You are not in a guild',
        });
    });

    it('should log an error and close the connection if the packet is invalid', async () => {
        packetMock.isValid.returns(false);
        packetMock.getErrorMessage = () => ['Invalid packet format'];

        await chatInPacketHandler.execute(connectionMock, packetMock);

        expect(loggerMock.error.calledWith('[ChatInPacketHandler] Packet invalid')).to.be.true;
        expect(connectionMock.close.calledOnce).to.be.true;
    });
});
