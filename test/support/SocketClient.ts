import { createConnection, Socket } from 'node:net';

export default class SocketClient {
    private client!: Socket;
    private data: Buffer<ArrayBufferLike> = Buffer.from([]);
    private onData!: (data: Buffer<ArrayBufferLike>) => void;

    async connect(host: string, port: number) {
        return new Promise((resolve, reject) => {
            this.client = createConnection({ host, port, timeout: 50000 }, () => {
                console.log(`Connected with server: ${host}:${port}`);
                resolve(this.client);
            });

            this.client.on('data', (data) => {
                this.data = Buffer.concat([this.data, data]);
                this.onData?.(data);
            });
            this.client.on('error', (err) => {
                console.error(`Connection error: ${err.message}`);
                reject(err);
            });
            this.client.on('end', () => {
                console.log('Disconnected from server');
            });
        });
    }

    nextMessage(length: number): Promise<Buffer<ArrayBufferLike>> {
        return new Promise((resolve) => {
            if (this.data.length >= length) {
                const data = this.data.subarray(0, length);
                this.data = this.data.subarray(length);
                return resolve(data);
            }

            const interval = setInterval(() => {
                if (this.data.length >= length) {
                    clearInterval(interval);
                    const data = this.data.subarray(0, length);
                    this.data = this.data.subarray(length);
                    resolve(data);
                }
            }, 50);
        });
    }

    sendMessage(message: Buffer<ArrayBufferLike>) {
        this.client.write(message);
    }

    getData() {
        return this.data;
    }

    async close(): Promise<void> {
        return new Promise((resolve) => {
            this.client.end(() => resolve());
        });
    }

    flush() {
        this.data = Buffer.from([]);
    }

    setOnData(onData: (data: Buffer<ArrayBufferLike>) => void) {
        this.onData = onData;
    }
}
