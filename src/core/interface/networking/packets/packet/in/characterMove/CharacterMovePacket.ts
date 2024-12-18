import { PacketHeaderEnum } from "@/core/enum/PacketHeaderEnum";
import PacketIn from "../PacketIn";
import CharacterMovePacketValidator from "./CharacterMovePacketValidator";

export default class CharacterMovePacket extends PacketIn {
    private movementType: number;
    private arg: number;
    private rotation: number;
    private positionX: number;
    private positionY: number;
    private time: number;

    constructor({ movementType, arg, rotation, positionX, positionY, time }) {
        super({
            header: PacketHeaderEnum.CHARACTER_MOVE,
            name: 'CharacterMovePacket',
            size: 17,
            validator: CharacterMovePacketValidator,
        });
        this.movementType = movementType;
        this.arg = arg;
        this.rotation = rotation;
        this.positionX = positionX;
        this.positionY = positionY;
        this.time = time;
    }

    getMovementType() {
        return this.movementType;
    }
    getArg() {
        return this.arg;
    }
    getRotation() {
        return this.rotation;
    }
    getPositionX() {
        return this.positionX;
    }
    getPositionY() {
        return this.positionY;
    }
    getTime() {
        return this.time;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.movementType = this.bufferReader.readUInt8();
        this.arg = this.bufferReader.readUInt8();
        this.rotation = this.bufferReader.readUInt8();
        this.positionX = this.bufferReader.readUInt32LE();
        this.positionY = this.bufferReader.readUInt32LE();
        this.time = this.bufferReader.readUInt32LE();
        this.validate();
        return this;
    }
}
