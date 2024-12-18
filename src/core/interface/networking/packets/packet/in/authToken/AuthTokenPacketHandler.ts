import Logger from '@/core/infra/logger/Logger';
import LoadCharactersService from '@/game/app/service/LoadCharactersService';
import AuthenticateService from '@/game/domain/service/AuthenticateService';
import { GameConfig } from '@/game/infra/config/GameConfig';
import PacketHandler from '../../PacketHandler';
import AuthTokenPacket from './AuthTokenPacket';
import GameConnection from '@/game/interface/networking/GameConnection';
import EmpirePacket from '../../bidirectional/empire/EmpirePacket';
import CharactersInfoPacket from '../../out/CharactersInfoPacket';
import Ip from '@/core/util/Ip';
import { ConnectionStateEnum } from '@/core/enum/ConnectionStateEnum';

export default class AuthTokenPacketHandler extends PacketHandler<AuthTokenPacket> {
    private readonly loadCharactersService: LoadCharactersService;
    private readonly authenticateService: AuthenticateService;
    private readonly config: GameConfig;
    private readonly logger: Logger;

    constructor({ loadCharactersService, authenticateService, config, logger }) {
        super();
        this.loadCharactersService = loadCharactersService;
        this.authenticateService = authenticateService;
        this.config = config;
        this.logger = logger;
    }

    async execute(connection: GameConnection, packet: AuthTokenPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[AuthTokenPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const key = packet.getKey();
        const username = packet.getUsername();

        const authResult = await this.authenticateService.execute(key, username);

        if (authResult.hasError()) {
            connection.close();
            return;
        }

        const { accountId } = authResult.getData();

        connection.setAccountId(accountId);

        const charactersResult = await this.loadCharactersService.execute({ accountId });

        if (charactersResult.isOk()) {
            const players = charactersResult.getData();

            if (players?.length > 0) {
                connection.send(
                    new EmpirePacket({
                        empireId: players[0].getEmpire(),
                    }),
                );

                const characterInfoPacket = new CharactersInfoPacket();
                players.forEach((player) => {
                    characterInfoPacket.addCharacter(player.getSlot(), {
                        name: player.getName(),
                        playerClass: player.getPlayerClass(),
                        bodyPart: player.getBodyPart(),
                        hairPart: player.getHairPart(),
                        level: player.getLevel(),
                        skillGroup: player.getSkillGroup(),
                        playTime: player.getPlayTime(),
                        port: Number(this.config.SERVER_PORT),
                        ip: Ip.toInt(this.config.REAL_SERVER_ADDRESS || this.config.SERVER_ADDRESS),
                        id: player.getId(),
                        nameChange: 0,
                        positionX: player.getPositionX(),
                        positionY: player.getPositionY(),
                        ht: player.getHt(), //vit
                        st: player.getSt(), //str
                        dx: player.getDx(), //des
                        iq: player.getIq(), //int
                    });
                });
                connection.send(characterInfoPacket);
            }
        }

        connection.setState(ConnectionStateEnum.SELECT);
    }
}
