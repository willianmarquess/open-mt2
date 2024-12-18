import Logger from '@/core/infra/logger/Logger';
import PacketHandler from '../../PacketHandler';
import ChatInPacket from './ChatInPacket';
import GameConnection from '@/game/interface/networking/GameConnection';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

export default class ChatInPacketHandler extends PacketHandler<ChatInPacket> {
    private logger: Logger;
    private commandManager: CommandManager;

    constructor({ logger, commandManager }) {
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
