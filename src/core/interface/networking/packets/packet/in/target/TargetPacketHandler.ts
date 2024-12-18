import GameConnection from '@/game/interface/networking/GameConnection';
import PacketHandler from '../../PacketHandler';
import TargetPacket from './TargetPacket';
import Logger from '@/core/infra/logger/Logger';
import CharacterUpdateTargetService from '@/game/app/service/CharacterUpdateTargetService';

export default class TargetPacketHandler extends PacketHandler<TargetPacket> {
    private logger: Logger;
    private characterUpdateTargetService: CharacterUpdateTargetService;

    constructor({ logger, characterUpdateTargetService }) {
        super();
        this.logger = logger;
        this.characterUpdateTargetService = characterUpdateTargetService;
    }

    async execute(connection: GameConnection, packet: TargetPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[TargetPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const player = connection.getPlayer();

        if (!player) {
            this.logger.info(
                `[TargetPacketHandler] The connection does not have a player selected, this cannot happen`,
            );
            connection.close();
            return;
        }

        await this.characterUpdateTargetService.execute(player, packet.getTargetVirtualId());
    }
}
