import Logger from '@/core/infra/logger/Logger';
import PacketHandler from '../../PacketHandler';
import ChatInPacket from './ChatInPacket';
import GameConnection from '@/game/interface/networking/GameConnection';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import CommandManager from '@/game/app/command/CommandManager';
import ChatService from '@/game/app/service/ChatService';

export default class ChatInPacketHandler extends PacketHandler<ChatInPacket> {
    private readonly logger: Logger;
    private readonly commandManager: CommandManager;
    private readonly chatService: ChatService;

    constructor({
        logger,
        commandManager,
        chatService,
    }: {
        logger: Logger;
        commandManager: CommandManager;
        chatService: ChatService;
    }) {
        super();
        this.logger = logger;
        this.commandManager = commandManager;
        this.chatService = chatService;
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
                if (message.length > 1 && message.startsWith('/')) {
                    await this.commandManager.execute({ message, player });
                    return;
                }

                this.chatService.talk(player, message);

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

                this.chatService.shout(player, message);

                break;
            case ChatMessageTypeEnum.COMMAND:
                this.logger.debug(`[ChatInPacketHandler] COMMAND CHAT: ${message}`);

                break;
            case ChatMessageTypeEnum.GROUP:
                this.logger.debug(`[ChatInPacketHandler] GROUP CHAT: ${message}`);

                player.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: '[SYSTEM] You are not in a party',
                });

                break;
            case ChatMessageTypeEnum.GUILD:
                this.logger.debug(`[ChatInPacketHandler] GUILD CHAT: ${message}`);

                player.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: '[SYSTEM] You are not in a guild',
                });

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
