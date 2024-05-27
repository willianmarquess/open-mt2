import ConnectionStateEnum from '../../../core/enum/ConnectionStateEnum.js';
import Connection from '../../../core/interface/networking/Connection.js';
import Queue from '../../../core/util/Queue.js';

const OUTGOING_MESSAGES_PER_CON_QUEUE_SIZE = 20;

const hexString = (buffer) =>
    buffer.reduce((acc, byte, index) => {
        // Convertendo o byte para uma string hexadecimal, garantindo dois dígitos e letras maiúsculas
        const hex = byte.toString(16).padStart(2, '0').toUpperCase();
        // Adicionando o traço de separação, exceto no primeiro byte
        return acc + (index > 0 ? '-' : '') + hex;
    }, '');

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
            console.log(hexString(message));
            this.socket.write(message);
        }
    }
}
