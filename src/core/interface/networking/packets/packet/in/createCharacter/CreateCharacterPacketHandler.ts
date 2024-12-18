import Logger from '@/core/infra/logger/Logger';
import CreateCharacterService from '@/game/app/service/CreateCharacterService';
import { GameConfig } from '@/game/infra/config/GameConfig';
import PacketHandler from '../../PacketHandler';
import CreateCharacterPacket from './CreateCharacterPacket';
import GameConnection from '@/game/interface/networking/GameConnection';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';
import CreateCharacterFailurePacket from '../../out/CreateCharacterFailurePacket';
import { CreateCharacterFailureReasonEnum } from '@/core/enum/CreateCharacterFailureReasonEnum';
import CreateCharacterSuccessPacket from '../../out/CreateCharacterSuccessPacket';
import Ip from '@/core/util/Ip';

export default class CreateCharacterPacketHandler extends PacketHandler<CreateCharacterPacket> {
    private readonly createCharacterService: CreateCharacterService;
    private readonly logger: Logger;
    private readonly config: GameConfig;

    constructor({ createCharacterService, logger, config }) {
        super();
        this.createCharacterService = createCharacterService;
        this.logger = logger;
        this.config = config;
    }

    async execute(connection: GameConnection, packet: CreateCharacterPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[CreateCharacterPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const accountId = connection.getAccountId();

        if (!accountId) {
            this.logger.info(
                `[CreateCharacterPacketHandler] The connection does not have an accountId, this cannot happen`,
            );
            connection.close();
            return;
        }

        const result = await this.createCharacterService.execute({
            playerName: packet.getPlayerName(),
            playerClass: packet.getPlayerClass(),
            appearance: packet.getAppearance(),
            slot: packet.getSlot(),
            accountId,
        });

        if (result.hasError()) {
            const error = result.getError();

            switch (error) {
                case ErrorTypesEnum.NAME_ALREADY_EXISTS:
                    connection.send(
                        new CreateCharacterFailurePacket({
                            reason: CreateCharacterFailureReasonEnum.NAME_ALREADY_EXISTS,
                        }),
                    );
                    break;
                case ErrorTypesEnum.ACCOUNT_FULL:
                case ErrorTypesEnum.EMPIRE_NOT_SELECTED:
                    connection.close();
                    break;
                default:
                    this.logger.info(`[CreateCharacterPacketHandler] Invalid error: ${error}`);
                    break;
            }
            return;
        }

        const player = result.getData();

        connection.send(
            new CreateCharacterSuccessPacket({
                slot: packet.getSlot(),
                character: {
                    name: player.getName(),
                    playerClass: player.getPlayerClass(),
                    bodyPart: player.getBodyPart(),
                    hairPart: player.getHairPart(),
                    level: player.getLevel(),
                    skillGroup: player.getSkillGroup(),
                    playTime: player.getPlayTime(),
                    port: Number(this.config.SERVER_PORT),
                    ip: Ip.toInt(this.config.SERVER_ADDRESS),
                    id: player.getId(),
                    nameChange: 0,
                    positionX: player.getPositionX(),
                    positionY: player.getPositionY(),
                    ht: player.getHt(),
                    st: player.getSt(),
                    dx: player.getDx(),
                    iq: player.getIq(),
                },
            }),
        );
    }
}
