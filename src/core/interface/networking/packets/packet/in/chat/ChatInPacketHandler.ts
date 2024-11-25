import { Logger } from 'winston';
import ChatMessageTypeEnum from '../../../../../../enum/ChatMessageTypeEnum.js';
import CommandManager from '../../../../../../../game/app/command/CommandManager.js';

export default class ChatInPacketHandler {
    private logger: Logger;
    private commandManager: CommandManager;

    constructor(logger: Logger, commandManager: CommandManager) {
        this.logger = logger;
        this.commandManager = commandManager;
    }

    async execute(connection: any, packet: any) {
        if (!packet.isValid()) {
            this.logger.error(`[ChatInPacketHandler] Packet invalid`);
            this.logger.error(packet.errors());
            connection.close();
            return;
        }
        const { player } = connection;
        if (!player) {
            this.logger.info(`[ChatInPacketHandler] The connection does not have an player select, this cannot happen`);
            connection.close();
            return;
        }
        const { message, messageType } = packet;
        switch (messageType) {
            case ChatMessageTypeEnum.NORMAL:
                this.logger.debug(`[ChatInPacketHandler] NORMAL CHAT: ${message}`);
                if (message.startsWith('/')) {
                    this.commandManager.execute({ message, player });
                }
                //send normal message to other players in map
                break;
            case ChatMessageTypeEnum.SHOUT:
                this.logger.debug(`[ChatInPacketHandler] SHOUT CHAT: ${message}`);
                //validate 15 sec countdown between shout
                //validate level min for shout
                break;
            case ChatMessageTypeEnum.COMMAND:
                this.logger.debug(`[ChatInPacketHandler] COMMAND CHAT: ${message}`);
                break;
            case ChatMessageTypeEnum.GROUP:
                this.logger.debug(`[ChatInPacketHandler] GROUP CHAT: ${message}`);
                break;
            case ChatMessageTypeEnum.GUILD:
                this.logger.debug(`[ChatInPacketHandler] GUILD CHAT: ${message}`);
                break;
            case ChatMessageTypeEnum.INFO:
                this.logger.debug(`[ChatInPacketHandler] INFO CHAT: ${message}`);
                break;
            default:
                this.logger.error(`[ChatInPacketHandler] INVALID CHAT: type: ${messageType}, message: ${message}`);
                break;
        }
    }
}
