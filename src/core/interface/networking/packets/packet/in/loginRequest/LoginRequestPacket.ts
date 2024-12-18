import { PacketHeaderEnum } from "@/core/enum/PacketHeaderEnum";
import PacketIn from "../PacketIn";
import LoginRequestPacketValidator from "./LoginRequestPacketValidator";

export default class LoginRequestPacket extends PacketIn {
    private username: string;
    private password: string;
    private key: number;

    constructor({ username, password, key }) {
        super({
            header: PacketHeaderEnum.LOGIN_REQUEST,
            name: 'LoginRequestPacket',
            size: 66,
            validator: LoginRequestPacketValidator,
        });
        this.username = username;
        this.password = password;
        this.key = key;
    }

    getUsername() {
        return this.username;
    }

    getPassword() {
        return this.password;
    }

    getKey() {
        return this.key;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.username = this.bufferReader.readString(31);
        this.password = this.bufferReader.readString(16);
        this.key = this.bufferReader.readUInt32LE();
        this.validate();
        return this;
    }
}
