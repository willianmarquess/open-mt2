import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import Logger from '@/core/infra/logger/Logger';
import Command from '@/game/domain/command/Command';
import { CommandMapValue } from '@/game/domain/command/Commands';

export default class CommandManager {
    private readonly logger: Logger;
    private readonly commands: Map<string, CommandMapValue<Command>>;
    private readonly container;

    constructor(container: { logger: Logger; commands: Map<string, CommandMapValue<Command>>; [key: string]: any }) {
        this.logger = container.logger;
        this.commands = container.commands;
        this.container = container;
    }

    async execute({ message, player }: { message: string; player: Player }) {
        //TODO: validate player flood chat, validate ban words
        if (message.startsWith('/help')) {
            for (const { command } of this.commands.values()) {
                player.chat({
                    message: `Command: ${command.getName()} - Description: ${command.getDescription()} ${command.getExample() ? `- Example: ${command.getExample()}` : ''} `,
                    messageType: ChatMessageTypeEnum.INFO,
                });
            }
            return;
        }

        const [commandName, ...args] = message.split(' ');

        const commandBuilder = this.commands.get(commandName);

        if (!commandBuilder) {
            this.logger.info(`[CommandManager] Invalid command: ${commandName}`);
            player.chat({
                message: `Invalid command: ${commandName}`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        const { command: Command, createHandler } = commandBuilder;

        const command = new Command({ args });
        const commandHandler = createHandler(this.container);
        await commandHandler.execute(player, command);
    }
}
