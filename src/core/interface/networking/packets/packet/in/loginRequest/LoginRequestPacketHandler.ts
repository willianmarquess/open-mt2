import { Logger } from "winston";
import LoginService from "../../../../../../../auth/app/service/LoginService.js";
import ErrorTypesEnum from "../../../../../../enum/ErrorTypesEnum.js";
import LoginStatusEnum from "../../../../../../enum/LoginStatusEnum.js";
import LoginFailedPacket from "../../out/LoginFailedPacket.js";
import LoginSuccessPacket from "../../out/LoginSuccessPacket.js";

const LOGIN_SUCCESS_RESULT = 1;

export default class LoginRequestPacketHandler {
  constructor(
    private readonly loginService: LoginService,
    private readonly logger: Logger,
  ) {}

  async execute(connection, packet) {
    if (!packet.isValid()) {
      this.#logger.error(`[LoginRequestPacketHandler] Packet invalid`);
      this.#logger.error(packet.errors());
      connection.close();
      return;
    }

    const { username, password } = packet;

    const result = await this.#loginService.execute({
      username,
      password,
    });

    if (result.hasError()) {
      const { error } = result;

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
          this.#logger.info(`[LoginRequestPacketHandler] Invalid error: ${error}`);
          break;
      }
      return;
    }

    const { data: key } = result;

    connection.send(
      new LoginSuccessPacket({
        key,
        result: LOGIN_SUCCESS_RESULT,
      }),
    );
  }
}
