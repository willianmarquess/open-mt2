import Logger from '@/core/infra/logger/Logger';
import CharacterMoveService from '@/game/app/service/CharacterMoveService';
import GameConnection from '@/game/interface/networking/GameConnection';
import CharacterMovePacket from './CharacterMovePacket';
import PacketHandler from '../../PacketHandler';

export default class CharacterMovePacketHandler extends PacketHandler<CharacterMovePacket> {
    private readonly logger: Logger;
    private readonly characterMoveService: CharacterMoveService;

    constructor({ logger, characterMoveService }) {
        super();
        this.logger = logger;
        this.characterMoveService = characterMoveService;
    }

    async execute(connection: GameConnection, packet: CharacterMovePacket) {
        if (!packet.isValid()) {
            this.logger.error(`[CharacterMovePacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const player = connection.getPlayer();

        if (!player) {
            this.logger.info(
                `[CharacterMovePacketHandler] The connection does not have an player select, this cannot happen`,
            );
            connection.close();
            return;
        }

        await this.characterMoveService.execute({
            player,
            movementType: packet.getMovementType(),
            positionX: packet.getPositionX(),
            positionY: packet.getPositionY(),
            arg: packet.getArg(),
            rotation: packet.getRotation(),
            time: packet.getTime(),
        });
    }
}
