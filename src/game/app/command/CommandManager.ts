import { Logger } from 'winston';
import ChatMessageTypeEnum from '../../../core/enum/ChatMessageTypeEnum.js';
import { AwilixContainer } from 'awilix';

export default class CommandManager {
    private logger: Logger;
    private commands: any;
    private container: AwilixContainer<any>;

    constructor(container: any) {
        this.logger = container.logger;
        this.commands = container.commands;
        this.container = container;
    }

    async execute(message: any, player: any) {
        // TODO: validate player flood chat
        // TODO: validate ban words
        if (message.startsWith('/help')) {
            for (const { command } of this.commands.values()) {
                player.say({
                    message: `Command: ${command.name} - Description: ${command.description} ${command.example ? ` - Example: ${command.example}` : ''} `,
                    messageType: ChatMessageTypeEnum.INFO,
                });
            }
            return;
        }
        const [commandName, ...args] = message.split(' ');
        if (!this.commands.has(commandName)) {
            this.logger.info(`[CommandManager] Invalid command: ${commandName}`);
            player.say({
                message: `Invalid command: ${commandName}`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }
        const { command: Command, createHandler } = this.commands.get(commandName);
        const command = new Command({ args });
        const commandHandler = createHandler(this.container);
        await commandHandler.execute(player, command);
    }
}
