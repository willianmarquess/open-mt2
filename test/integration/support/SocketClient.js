import { createConnection } from 'node:net';

export default class SocketClient {
    #client;
    #data = Buffer.from([]);

    async connect(host, port) {
        return new Promise((resolve, reject) => {
            this.#client = createConnection({ host, port }, () => {
                console.log(`Conectado ao servidor em ${host}:${port}`);
                resolve(this.#client);
            });

            this.#client.on('data', (data) => {
                console.log('mensagem recebida');
                this.#data = Buffer.concat([this.#data, data]);
            });
            this.#client.on('error', (err) => {
                console.error(`Erro na conexão: ${err.message}`);
                reject(err);
            });
            this.#client.on('end', () => {
                console.log('Desconectado do servidor');
            });
        });
    }

    nextMessage(length) {
        return new Promise((resolve) => {
            if (this.#data.length >= length) {
                const data = this.#data.subarray(0, length);
                this.#data = this.#data.subarray(length);
                return resolve(data);
            }

            const interval = setInterval(() => {
                if (this.#data.length >= length) {
                    clearInterval(interval);
                    const data = this.#data.subarray(0, length);
                    this.#data = this.#data.subarray(length);
                    resolve(data);
                }
            }, 50);
        });
    }

    sendMessage(message) {
        this.#client.write(message);
    }

    async close() {
        return new Promise((resolve) => {
            this.#client.end(() => resolve());
        });
    }
}
