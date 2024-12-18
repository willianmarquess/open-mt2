import Logger from "@/core/infra/logger/Logger";
import PacketHandler from "../../PacketHandler";
import AttackPacket from "./AttackPacket";
import CharacterAttackService from "@/game/app/service/CharacterAttackService";
import GameConnection from "@/game/interface/networking/GameConnection";

export default class AttackPacketHandler extends PacketHandler<AttackPacket> {
    private readonly logger: Logger;
    private readonly characterAttackService: CharacterAttackService;

    constructor({ logger, characterAttackService }) {
        super();
        this.logger = logger;
        this.characterAttackService = characterAttackService;
    }

    async execute(connection: GameConnection, packet: AttackPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[AttackPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const player = connection.getPlayer();

        if (!player) {
            this.logger.info(`[AttackPacketHandler] The connection does not have a player select, this cannot happen`);
            connection.close();
            return;
        }

        await this.characterAttackService.execute(player, packet.getAttackType(), packet.getVictimVirtualId());
    }
}
