import Connection from '@/core/interface/networking/Connection';
import Logger from '@/core/infra/logger/Logger';
import PacketHandler from '../../PacketHandler';
import MarkLoginPacket from './MarkLoginPacket';

export default class MarkLoginPacketHandler extends PacketHandler<MarkLoginPacket> {
    private readonly logger: Logger;

    constructor({ logger }: { logger: Logger }) {
        super();
        this.logger = logger;
    }

    async execute(connection: Connection) {
        this.logger.info(
            `[MarkLoginPacketHandler] Guild mark login requested but this is not a mark server, closing connection: ID: ${connection.getId()}`,
        );
        connection.close();
    }
}
