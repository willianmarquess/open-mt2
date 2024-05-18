import ConnectionStateEnum from '../../../core/enum/ConnectionStateEnum.js';
import Connection from '../../../core/interface/networking/Connection.js';
import Queue from '../../../core/util/Queue.js';

const OUTGOING_MESSAGES_PER_CON_QUEUE_SIZE = 20;

export default class GameConnection extends Connection {
    #accountId;
    #outgoingMessages = new Queue(OUTGOING_MESSAGES_PER_CON_QUEUE_SIZE);

    set accountId(value) {
        this.#accountId = value;
    }

    get accountId() {
        return this.#accountId;
    }

    onHandshakeSuccess() {
        this.logger.info('[HANDSHAKE] Finished');
        this.state = ConnectionStateEnum.LOGIN;
    }

    send(packet) {
        this.#outgoingMessages.enqueue(packet.pack());
    }

    async sendPendingMessages() {
        for (const message of this.#outgoingMessages.dequeueIterator()) {
            this.socket.write(message);
        }
    }
}
