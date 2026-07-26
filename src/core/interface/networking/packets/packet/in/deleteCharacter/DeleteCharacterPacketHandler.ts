import Logger from '@/core/infra/logger/Logger';
import DeleteCharacterService from '@/game/app/service/DeleteCharacterService';
import PacketHandler from '../../PacketHandler';
import DeleteCharacterPacket from './DeleteCharacterPacket';
import GameConnection from '@/game/interface/networking/GameConnection';
import DeleteCharacterSuccessPacket from '../../out/DeleteCharacterSuccessPacket';
import DeleteCharacterFailurePacket from '../../out/DeleteCharacterFailurePacket';

export default class DeleteCharacterPacketHandler extends PacketHandler<DeleteCharacterPacket> {
    private readonly deleteCharacterService: DeleteCharacterService;
    private readonly logger: Logger;

    constructor({
        deleteCharacterService,
        logger,
    }: {
        deleteCharacterService: DeleteCharacterService;
        logger: Logger;
    }) {
        super();
        this.deleteCharacterService = deleteCharacterService;
        this.logger = logger;
    }

    async execute(connection: GameConnection, packet: DeleteCharacterPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[DeleteCharacterPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const accountId = connection.getAccountId();

        if (!accountId) {
            this.logger.info(
                `[DeleteCharacterPacketHandler] The connection does not have an accountId, this cannot happen`,
            );
            connection.close();
            return;
        }

        const result = await this.deleteCharacterService.execute({
            accountId,
            slot: packet.getSlot(),
            privateCode: packet.getPrivateCode(),
        });

        if (result.hasError()) {
            connection.send(new DeleteCharacterFailurePacket());
            return;
        }

        connection.send(new DeleteCharacterSuccessPacket({ slot: packet.getSlot() }));
    }
}
