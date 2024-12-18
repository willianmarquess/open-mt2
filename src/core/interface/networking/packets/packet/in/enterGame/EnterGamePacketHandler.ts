import Logger from '@/core/infra/logger/Logger';
import EnterGameService from '@/game/app/service/EnterGameService';
import PacketHandler from '../../PacketHandler';
import EnterGamePacket from './EnterGamePacket';
import GameConnection from '@/game/interface/networking/GameConnection';
import { ConnectionStateEnum } from '@/core/enum/ConnectionStateEnum';
import GameTimePacket from '../../out/GameTimePacket';
import ChannelPacket from '../../out/ChannelPacket';

export default class EnterGamePacketHandler extends PacketHandler<EnterGamePacket> {
    private readonly enterGameService: EnterGameService;
    private readonly logger: Logger;

    constructor({ enterGameService, logger }) {
        super();
        this.enterGameService = enterGameService;
        this.logger = logger;
    }

    async execute(connection: GameConnection) {
        this.logger.debug(`[EnterGamePacketHandler] Enter game received, id: ${connection.getId()}`);
        const player = connection.getPlayer();

        if (!player) {
            this.logger.info(
                `[EnterGamePacketHandler] The connection does not have an player select, this cannot happen`,
            );
            connection.close();
            return;
        }

        connection.setState(ConnectionStateEnum.GAME);
        connection.send(new GameTimePacket({ time: performance.now() }));
        connection.send(new ChannelPacket({ channel: 1 }));

        this.enterGameService.execute(player);
    }
}
