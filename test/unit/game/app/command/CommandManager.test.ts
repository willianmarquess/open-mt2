import { expect } from 'chai';
import sinon from 'sinon';
import CommandManager from '@/game/app/command/CommandManager';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

describe('CommandManager', () => {
    let commandManager: CommandManager;
    let loggerStub;
    let playerStub;
    let containerStub;
    let commandStub;
    let commandHandlerStub;

    beforeEach(() => {
        loggerStub = {
            info: sinon.stub(),
        };
        playerStub = {
            chat: sinon.stub(),
        };
        commandStub = class {
            static getName = sinon.stub().returns('testCommand');
            static getDescription = sinon.stub().returns('Test command description');
            static getExample = sinon.stub().returns('Example usage');
        };
        commandHandlerStub = {
            execute: sinon.stub().resolves(),
        };
        containerStub = {
            logger: loggerStub,
            commands: new Map([['/test', { command: commandStub, createHandler: () => commandHandlerStub }]]),
        };

        commandManager = new CommandManager(containerStub);
    });

    afterEach(() => sinon.restore());

    it('should list all commands when /help is used', async () => {
        await commandManager.execute({ message: '/help', player: playerStub });

        expect(playerStub.chat.calledOnce).to.be.true;
        expect(
            playerStub.chat.calledWith({
                message: `Command: ${commandStub.getName()} - Description: ${commandStub.getDescription()} - Example: ${commandStub.getExample()} `,
                messageType: ChatMessageTypeEnum.INFO,
            }),
        ).to.be.true;
    });

    it('should handle invalid command', async () => {
        await commandManager.execute({ message: '/invalid', player: playerStub });

        expect(loggerStub.info.calledOnce).to.be.true;
        expect(loggerStub.info.calledWith('[CommandManager] Invalid command: /invalid')).to.be.true;
        expect(playerStub.chat.calledOnce).to.be.true;
        expect(
            playerStub.chat.calledWith({
                message: 'Invalid command: /invalid',
                messageType: ChatMessageTypeEnum.INFO,
            }),
        ).to.be.true;
    });

    it('should execute valid command', async () => {
        await commandManager.execute({ message: '/test arg1 arg2', player: playerStub });

        expect(commandHandlerStub.execute.calledOnce).to.be.true;
        expect(commandHandlerStub.execute.calledOnce).to.be.true;
    });
});
