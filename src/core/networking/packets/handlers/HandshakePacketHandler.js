import ConnectionStateEnum from '../../../enum/ConnectionStateEnum.js';

export default class HandshakePacketHandler {
    async execute(connection) {
        connection.state = ConnectionStateEnum.AUTH;
    }
}
