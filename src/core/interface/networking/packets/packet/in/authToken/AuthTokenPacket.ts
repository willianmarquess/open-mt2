import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import AuthTokenPacketValidator from './AuthTokenPacketValidator';

export default class AuthTokenPacket extends PacketIn {
    private username: string;
    private key: number;
    private xteaKeys: number[];

    constructor({ username, key, xteaKeys }) {
        super({
            header: PacketHeaderEnum.TOKEN,
            name: 'AuthTokenPacket',
            size: 52,
            validator: AuthTokenPacketValidator,
        });
        this.username = username;
        this.key = key;
        this.xteaKeys = xteaKeys;
    }

    getUsername() {
        return this.username;
    }

    getKey() {
        return this.key;
    }

    getXteaKeys() {
        return this.xteaKeys;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.username = this.bufferReader.readString(31);
        this.key = this.bufferReader.readUInt32LE();
        this.xteaKeys = [
            this.bufferReader.readUInt32LE(),
            this.bufferReader.readUInt32LE(),
            this.bufferReader.readUInt32LE(),
            this.bufferReader.readUInt32LE(),
        ];
        this.validate();
        return this;
    }
}
