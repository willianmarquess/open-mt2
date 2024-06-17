import ServerStatusPacket from '../../out/ServerStatusPacket.js';

export default class ServerStatusRequestPacketHandler {
    #config;

    constructor({ config }) {
        this.#config = config;
    }

    async execute(connection) {
        connection.send(
            new ServerStatusPacket({
                status: [
                    {
                        port: this.#config.SERVER_PORT,
                        status: 1,
                    },
                ],
                isSuccess: true,
            }),
        );
    }
}
