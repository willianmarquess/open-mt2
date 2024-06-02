import ConnectionStateEnum from '../../../core/enum/ConnectionStateEnum.js';
import ChannelPacket from '../../../core/interface/networking/packets/packet/out/ChannelPacket.js';
import GameTimePacket from '../../../core/interface/networking/packets/packet/out/GameTimePacket.js';

export default class EnterGameService {
    #logger;
    #world;

    constructor({ logger, world }) {
        this.#logger = logger;
        this.#world = world;
    }

    execute(connection) {
        this.#logger.info(`[EnterGameService] enter game received, id: ${connection.id}`);
        const { player } = connection;

        if (!player) {
            this.#logger.info(`[EnterGameService] The connection does not have an player select, this cannot happen`);
            connection.close();
            return;
        }

        connection.state = ConnectionStateEnum.GAME;
        connection.send(new GameTimePacket({ time: performance.now() }));
        connection.send(new ChannelPacket({ channel: 1 }));

        player.spawn();
        this.#world.spawn(player);
    }
}
