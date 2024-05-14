import AuthConnection from '../networking/AuthConnection.js';
import Server from '../../../core/interface/server/Server.js';

export default class AuthServer extends Server {
    createConnection(socket) {
        return new AuthConnection({
            socket,
            logger: this.logger,
            packets: this.packets,
        });
    }
}
