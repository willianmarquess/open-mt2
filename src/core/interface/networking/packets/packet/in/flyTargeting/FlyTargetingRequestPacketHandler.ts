import Logger from '@/core/infra/logger/Logger';
import PacketHandler from '../../PacketHandler';
import FlyTargetingRequestPacket from './FlyTargetingRequestPacket';
import GameConnection from '@/game/interface/networking/GameConnection';
import CharacterFlyTargetingService from '@/game/app/service/CharacterFlyTargetingService';

export default class FlyTargetingRequestPacketHandler extends PacketHandler<FlyTargetingRequestPacket> {
    private readonly logger: Logger;
    private readonly characterFlyTargetingService: CharacterFlyTargetingService;

    constructor({
        logger,
        characterFlyTargetingService,
    }: {
        logger: Logger;
        characterFlyTargetingService: CharacterFlyTargetingService;
    }) {
        super();
        this.logger = logger;
        this.characterFlyTargetingService = characterFlyTargetingService;
    }

    async execute(connection: GameConnection, packet: FlyTargetingRequestPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[FlyTargetingRequestPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const player = connection.getPlayer();

        if (!player) {
            this.logger.info(
                `[FlyTargetingRequestPacketHandler] The connection does not have a player selected, this cannot happen`,
            );
            connection.close();
            return;
        }

        await this.characterFlyTargetingService.execute(
            player,
            packet.getTargetVirtualId(),
            packet.getPositionX(),
            packet.getPositionY(),
            false,
        );
    }
}
