import Server from '../../../core/interface/server/Server.js';
import GameConnection from '../networking/GameConnection.js';

export default class GameServer extends Server {
    createConnection(socket) {
        return new GameConnection({
            socket,
            logger: this.logger,
            packets: this.packets,
        });
    }
}
