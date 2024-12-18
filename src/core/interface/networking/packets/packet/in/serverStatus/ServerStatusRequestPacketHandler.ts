import { GameConfig } from '@/game/infra/config/GameConfig';
import GameConnection from '@/game/interface/networking/GameConnection';
import ServerStatusPacket from '../../out/ServerStatusPacket';
import PacketHandler from '../../PacketHandler';

export default class ServerStatusRequestPacketHandler extends PacketHandler<ServerStatusPacket> {
    private readonly config: GameConfig;

    constructor({ config }) {
        super();
        this.config = config;
    }

    async execute(connection: GameConnection) {
        connection.send(
            new ServerStatusPacket({
                status: [
                    {
                        port: Number(this.config.SERVER_PORT),
                        status: 1,
                    },
                ],
                isSuccess: true,
            }),
        );
    }
}
