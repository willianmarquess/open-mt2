import PacketIn from '../PacketIn';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import AttackPacketValidator from './AttackPacketValidator';

/**
 * Mirrors TPacketCGAttack (char_battle.cpp): `skillVnum` (the original's bType) is 0 for a plain
 * attack, or the vnum of the ATTACK skill whose hit is landing right now - it's not a style enum
 * (melee/ranged/magic), those are decided by the attacker's own weapon/battle type instead.
 */
export default class AttackPacket extends PacketIn {
    private skillVnum: number;
    private victimVirtualId: number;
    private unknown1: number = 0;
    private unknown2: number = 0;

    constructor({ skillVnum, victimVirtualId }: { skillVnum: number; victimVirtualId: number }) {
        super({
            header: PacketHeaderEnum.ATTACK,
            name: 'AttackPacket',
            size: 8,
            validator: AttackPacketValidator,
        });
        this.skillVnum = skillVnum;
        this.victimVirtualId = victimVirtualId;
    }

    getSkillVnum() {
        return this.skillVnum;
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
        this.skillVnum = this.bufferReader.readUInt8();
        this.victimVirtualId = this.bufferReader.readUInt32LE();
        this.unknown1 = this.bufferReader.readUInt8();
        this.unknown2 = this.bufferReader.readUInt8();
        this.validate();
        return this;
    }
}
