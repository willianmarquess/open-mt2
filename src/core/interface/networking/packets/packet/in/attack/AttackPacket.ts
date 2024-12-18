import { AttackTypeEnum } from "@/core/enum/AttackTypeEnum";
import PacketIn from "../PacketIn";
import { PacketHeaderEnum } from "@/core/enum/PacketHeaderEnum";
import AttackPacketValidator from "./AttackPacketValidator";

export default class AttackPacket extends PacketIn {
    private attackType: AttackTypeEnum;
    private victimVirtualId: number;
    private unknown1: number = 0;
    private unknown2: number = 0;

    constructor({ attackType, victimVirtualId }) {
        super({
            header: PacketHeaderEnum.ATTACK,
            name: 'AttackPacket',
            size: 8,
            validator: AttackPacketValidator,
        });
        this.attackType = attackType;
        this.victimVirtualId = victimVirtualId;
    }

    getAttackType() {
        return this.attackType;
    }
    getVictimVirtualId() {
        return this.victimVirtualId;
    }
    getUnknown1() {
        return this.unknown1;
    }
    getUnknown2() {
        return this.unknown2;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.attackType = this.bufferReader.readUInt8();
        this.victimVirtualId = this.bufferReader.readUInt32LE();
        this.unknown1 = this.bufferReader.readUInt8();
        this.unknown2 = this.bufferReader.readUInt8();
        this.validate();
        return this;
    }
}
