import Logger from '@/core/infra/logger/Logger';
import PacketHandler from '../../PacketHandler';
import ShootPacket from './ShootPacket';
import GameConnection from '@/game/interface/networking/GameConnection';
import CharacterShootService from '@/game/app/service/CharacterShootService';

export default class ShootPacketHandler extends PacketHandler<ShootPacket> {
    private readonly logger: Logger;
    private readonly characterShootService: CharacterShootService;

    constructor({ logger, characterShootService }: { logger: Logger; characterShootService: CharacterShootService }) {
        super();
        this.logger = logger;
        this.characterShootService = characterShootService;
    }

    async execute(connection: GameConnection, packet: ShootPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[ShootPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const player = connection.getPlayer();

        if (!player) {
            this.logger.info(`[ShootPacketHandler] The connection does not have a player selected, this cannot happen`);
            connection.close();
            return;
        }

        await this.characterShootService.execute(player, packet.getType());
    }
}
