import Logger from '@/core/infra/logger/Logger';
import PacketHandler from '../../PacketHandler';
import ChatInPacket from './ChatInPacket';
import GameConnection from '@/game/interface/networking/GameConnection';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import CommandManager from '@/game/app/command/CommandManager';

export default class ChatInPacketHandler extends PacketHandler<ChatInPacket> {
    private readonly logger: Logger;
    private readonly commandManager: CommandManager;

    constructor({ logger, commandManager }: { logger: Logger; commandManager: CommandManager }) {
        super();
        this.logger = logger;
        this.commandManager = commandManager;
    }

    async execute(connection: GameConnection, packet: ChatInPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[ChatInPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const player = connection.getPlayer();

        if (!player) {
            this.logger.info(`[ChatInPacketHandler] The connection does not have an player select, this cannot happen`);
            connection.close();
            return;
        }

        const message = packet.getMessage();
        const messageType = packet.getMessageType();

        // Dropped silently, the way the original handles a client talking too
        // fast: closing the connection would punish a burst of legitimate
        // typing, and a spam module gets nothing out of either.
        if (!player.isChatAllowed()) {
            this.logger.debug(`[ChatInPacketHandler] Chat flood from ${player.getName()}, message dropped`);
            return;
        }

        switch (messageType) {
            case ChatMessageTypeEnum.NORMAL:
                this.logger.debug(`[ChatInPacketHandler] NORMAL CHAT: ${message}`);
                if (message.startsWith('/')) {
                    await this.commandManager.execute({ message, player });
                }

                //TODO: send normal message to other players in map

                break;
            case ChatMessageTypeEnum.SHOUT:
                this.logger.debug(`[ChatInPacketHandler] SHOUT CHAT: ${message}`);

                if (!player.hasShoutLevel()) {
                    player.chat({
                        messageType: ChatMessageTypeEnum.INFO,
                        message: `[SYSTEM] You must be at least level ${player.getShoutMinLevel()} to shout`,
                    });
                    return;
                }

                if (!player.isShoutAllowed()) return;

                //TODO: send shout to every player in the empire

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
