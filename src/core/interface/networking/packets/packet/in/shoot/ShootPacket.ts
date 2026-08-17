import PacketIn from '../PacketIn';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import ShootPacketValidator from './ShootPacketValidator';

/**
 * @packet
 * @type In
 * @name ShootPacket
 * @header 0x36
 * @size 2
 * @description Mirrors TPacketCGShoot (packet.h): fired when the client releases a ranged attack. `type` is the original's bType - 0 for a plain bow shot, or the vnum of the ranged skill landing now - resolved against whichever target(s) were staged by the preceding FlyTargeting/AddFlyTargeting packets (see CHARACTER::Shoot, char_battle.cpp:2985).
 * @fields
 *   - {byte} header 1 Packet header
 *   - {byte} type 1 0 for a plain bow shot, or the vnum of the ranged skill being fired
 */
export default class ShootPacket extends PacketIn {
    private type: number;

    constructor({ type }: { type: number }) {
        super({
            header: PacketHeaderEnum.SHOOT,
            name: 'ShootPacket',
            size: 2,
            validator: ShootPacketValidator,
        });
        this.type = type;
    }

    getType() {
        return this.type;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.type = this.bufferReader.readUInt8();
        this.validate();
        return this;
    }
}
