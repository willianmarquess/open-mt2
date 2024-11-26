import ChatMessageTypeEnum from '../../../core/enum/ChatMessageTypeEnum.js';

export default class CommandManager {
    #logger;
    #commands;
    #container;

    constructor(container) {
        this.#logger = container.logger;
        this.#commands = container.commands;
        this.#container = container;
    }

    async execute({ message, player }) {
        //validade player flood chat
        //validate ban words
        if (message.startsWith('/help')) {
            for (const { command } of this.#commands.values()) {
                player.chat({
                    message: `Command: ${command.name} - Description: ${command.description} ${command.example ? ` - Example: ${command.example}` : ''} `,
                    messageType: ChatMessageTypeEnum.INFO,
                });
            }
            return;
        }

        const [commandName, ...args] = message.split(' ');

        if (!this.#commands.has(commandName)) {
            this.#logger.info(`[CommandManager] Invalid command: ${commandName}`);
            player.chat({
                message: `Invalid command: ${commandName}`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        const { command: Command, createHandler } = this.#commands.get(commandName);

        const command = new Command({ args });
        const commandHandler = createHandler(this.#container);
        await commandHandler.execute(player, command);
    }
}
