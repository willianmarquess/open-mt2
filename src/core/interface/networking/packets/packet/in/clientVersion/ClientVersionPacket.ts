import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';

export default class ClientVersionPacket extends PacketIn {
    private clientName: string;
    private timeStamp: string;

    constructor({ clientName, timeStamp }) {
        super({
            header: PacketHeaderEnum.CLIENT_VERSION,
            name: 'ClientVersionPacket',
            size: 67,
        });
        this.clientName = clientName;
        this.timeStamp = timeStamp;
    }

    getClientName() {
        return this.clientName;
    }

    getTimeStamp() {
        return this.timeStamp;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.clientName = this.bufferReader.readString(33);
        this.timeStamp = this.bufferReader.readString(33);

        return this;
    }
}
