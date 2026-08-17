import GameConnection from '@/game/interface/networking/GameConnection';
import PacketHandler from '../../PacketHandler';
import SkillUsePacket from './SkillUsePacket';
import Logger from '@/core/infra/logger/Logger';
import { EntityManager } from '@/core/domain/manager/EntityManager';
import Player from '@/core/domain/entities/game/player/Player';
import Monster from '@/core/domain/entities/game/mob/Monster';
import Stone from '@/core/domain/entities/game/mob/Stone';

export default class SkillUsePacketHandler extends PacketHandler<SkillUsePacket> {
    private readonly logger: Logger;
    private readonly entityManager: EntityManager;

    constructor({ logger, entityManager }: { logger: Logger; entityManager: EntityManager }) {
        super();
        this.logger = logger;
        this.entityManager = entityManager;
    }

    async execute(connection: GameConnection, packet: SkillUsePacket) {
        if (!packet.isValid()) {
            this.logger.error(`[SkillUsePacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const player = connection.getPlayer();

        if (!player) {
            this.logger.info(
                `[SkillUsePacketHandler] The connection does not have a player selected, this cannot happen`,
            );
            connection.close();
            return;
        }

        const target = this.entityManager.getEntity(packet.getTargetVirtualId());

        if (!(target?.isMob() || target?.isPlayer()) && packet.getTargetVirtualId() > 0) {
            this.logger.info(`[SkillUsePacketHandler] Invalid target with virtualId ${packet.getTargetVirtualId()}`);
            return;
        }

        player.useSkill(packet.getSkillNum(), target as Player | Monster | Stone);
    }
}
