import ConnectionStateEnum from '../../../../enum/ConnectionStateEnum.js';
import EmpirePacket from '../packet/bidirectional/EmpirePacket.js';

export default class AuthTokenPacketHandler {
    #authenticateUseCase;
    #loadCharactersUseCase;

    constructor({ authenticateUseCase, loadCharactersUseCase }) {
        this.#authenticateUseCase = authenticateUseCase;
        this.#loadCharactersUseCase = loadCharactersUseCase;
    }

    async execute(connection, packet) {
        const authResult = await this.#authenticateUseCase.execute({
            key: packet.key,
            username: packet.username,
        });

        if (authResult.hasError()) {
            connection.close();
            return;
        }

        const { data: token } = authResult;
        connection.accountId = token.accountId;

        const loadCharactersResult = await this.#loadCharactersUseCase.execute({
            accountId: token.accountId,
        });

        if (loadCharactersResult.isOk()) {
            const {
                data: { empireId },
            } = loadCharactersResult;

            connection.send(
                new EmpirePacket({
                    empireId,
                }),
            );
            //we need to send player packet
        }

        connection.state = ConnectionStateEnum.SELECT;
    }
}
