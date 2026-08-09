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
import SessionManager from '@/game/domain/manager/SessionManager';
import LoginFailedPacket from '../../out/LoginFailedPacket';
import LoginStatusEnum from '@/core/enum/LoginStatusEnum';

export default class AuthTokenPacketHandler extends PacketHandler<AuthTokenPacket> {
    private readonly loadCharactersService: LoadCharactersService;
    private readonly authenticateService: AuthenticateService;
    private readonly sessionManager: SessionManager;
    private readonly config: GameConfig;
    private readonly logger: Logger;

    constructor({
        loadCharactersService,
        authenticateService,
        sessionManager,
        config,
        logger,
    }: {
        loadCharactersService: LoadCharactersService;
        authenticateService: AuthenticateService;
        sessionManager: SessionManager;
        config: GameConfig;
        logger: Logger;
    }) {
        super();
        this.loadCharactersService = loadCharactersService;
        this.authenticateService = authenticateService;
        this.sessionManager = sessionManager;
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

        const token = authResult.getData();

        if (!token) {
            connection.close();
            return;
        }

        const liveConnection = this.sessionManager.get(token.accountId);

        if (liveConnection) {
            this.logger.info(
                `[AuthTokenPacketHandler] Account ${token.accountId} is already connected, dropping both sessions`,
            );
            liveConnection.close();
            connection.send(new LoginFailedPacket({ status: LoginStatusEnum.ALREADY_CONNECTED }));
            connection.closeGracefully();
            return;
        }

        connection.setAccountId(token.accountId);
        this.sessionManager.set(token.accountId, connection);

        const charactersResult = await this.loadCharactersService.execute({ accountId: token.accountId });

        if (charactersResult.isOk()) {
            const players = charactersResult.getData()!;

            if (players?.length > 0) {
                connection.send(
                    new EmpirePacket({
                        empireId: players[0].empire,
                    }),
                );

                const characterInfoPacket = new CharactersInfoPacket();
                players.forEach((player) => {
                    characterInfoPacket.addCharacter(player.slot, {
                        name: player.name,
                        playerClass: player.playerClass,
                        bodyPart: player.bodyPart,
                        hairPart: player.hairPart,
                        level: player.level,
                        skillGroup: player.skillGroup,
                        playTime: player.playTime,
                        port: Number(this.config.SERVER_PORT),
                        ip: Ip.toInt(this.config.REAL_SERVER_ADDRESS || this.config.SERVER_ADDRESS),
                        id: player.id,
                        nameChange: 0,
                        positionX: player.positionX,
                        positionY: player.positionY,
                        ht: player.ht, //vit
                        st: player.st, //str
                        dx: player.dx, //des
                        iq: player.iq, //int
                    });
                });
                connection.send(characterInfoPacket);
            }
        }

        connection.setState(ConnectionStateEnum.SELECT);
    }
}
