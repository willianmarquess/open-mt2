import ConnectionStateEnum from '../../../../enum/ConnectionStateEnum.js';
import ChannelPacket from '../packet/out/ChannelPacket.js';
import GameTimePacket from '../packet/out/GameTimePacket.js';

export default class EnterGamePacketHandler {
    #enterGameService;
    #logger;

    constructor({ enterGameService, logger }) {
        this.#enterGameService = enterGameService;
        this.#logger = logger;
    }

    async execute(connection) {
        this.#logger.debug(`[EnterGamePacketHandler] Enter game received, id: ${connection.id}`);
        const { player } = connection;

        if (!player) {
            this.#logger.info(
                `[EnterGamePacketHandler] The connection does not have an player select, this cannot happen`,
            );
            connection.close();
            return;
        }

        connection.state = ConnectionStateEnum.GAME;
        connection.send(new GameTimePacket({ time: performance.now() }));
        connection.send(new ChannelPacket({ channel: 1 }));

        await this.#enterGameService.execute({ player });
    }
}
