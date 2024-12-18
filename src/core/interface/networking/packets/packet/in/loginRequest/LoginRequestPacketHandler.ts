import LoginService from "@/auth/app/service/LoginService";
import Logger from "@/core/infra/logger/Logger";
import PacketHandler from "../../PacketHandler";
import LoginRequestPacket from "./LoginRequestPacket";
import GameConnection from "@/game/interface/networking/GameConnection";
import { ErrorTypesEnum } from "@/core/enum/ErrorTypesEnum";
import LoginFailedPacket from "../../out/LoginFailedPacket";
import LoginStatusEnum from "@/core/enum/LoginStatusEnum";
import LoginSuccessPacket from "../../out/LoginSuccessPacket";

const LOGIN_SUCCESS_RESULT = 1;

export default class LoginRequestPacketHandler extends PacketHandler<LoginRequestPacket> {
    private readonly loginService: LoginService;
    private readonly logger: Logger;

    constructor({ loginService, logger }) {
        super();
        this.loginService = loginService;
        this.logger = logger;
    }

    async execute(connection: GameConnection, packet: LoginRequestPacket) {
        if (!packet.isValid()) {
            this.logger.error(`[LoginRequestPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const username = packet.getUsername();
        const password = packet.getPassword();

        const result = await this.loginService.execute({
            username,
            password,
        });

        if (result.hasError()) {
            const error = result.getError();

            switch (error) {
                case ErrorTypesEnum.INVALID_USERNAME:
                case ErrorTypesEnum.INVALID_PASSWORD:
                    connection.send(
                        new LoginFailedPacket({
                            status: LoginStatusEnum.LOGIN_OR_PASS_INCORRECT,
                        }),
                    );
                    break;

                default:
                    this.logger.info(`[LoginRequestPacketHandler] Invalid error: ${error}`);
                    break;
            }
            return;
        }

        const key = result.getData();

        connection.send(
            new LoginSuccessPacket({
                key,
                result: LOGIN_SUCCESS_RESULT,
            }),
        );
    }
}
