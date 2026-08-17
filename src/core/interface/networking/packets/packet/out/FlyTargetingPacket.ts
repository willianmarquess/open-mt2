import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name FlyTargetingPacket
 * @header 0x47
 * @size 17
 * @description Draws a projectile flying from a shooter to a target. The client homes it on the target when the target is in view, otherwise it flies to the given position. Mirrors CHARACTER::FlyTarget (char_battle.cpp:3008): sent with header 0x45 (ADD_FLY_TARGETING) instead of 0x47 when it echoes a HEADER_CG_ADD_FLY_TARGETING request (multi-shot skill queuing another target rather than replacing the pending one).
 * @fields
 *   - {byte} header 1 Packet header (0x47, or 0x45 when isAdd)
 *   - {number} shooterVirtualId 4 Entity the projectile starts from
 *   - {number} targetVirtualId 4 Entity the projectile homes on
 *   - {number} positionX 4 Fallback target position X
 *   - {number} positionY 4 Fallback target position Y
 */

export default class FlyTargetingPacket extends PacketOut {
    private readonly shooterVirtualId: number;
    private readonly targetVirtualId: number;
    private readonly positionX: number;
    private readonly positionY: number;

    constructor({
        shooterVirtualId,
        targetVirtualId,
        positionX,
        positionY,
        isAdd = false,
    }: {
        shooterVirtualId: number;
        targetVirtualId: number;
        positionX: number;
        positionY: number;
        isAdd?: boolean;
    }) {
        super({
            header: isAdd ? PacketHeaderEnum.ADD_FLY_TARGETING : PacketHeaderEnum.FLY_TARGETING,
            name: 'FlyTargetingPacket',
            size: 17,
        });
        this.shooterVirtualId = shooterVirtualId;
        this.targetVirtualId = targetVirtualId;
        this.positionX = positionX;
        this.positionY = positionY;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.shooterVirtualId);
        this.bufferWriter.writeUint32LE(this.targetVirtualId);
        this.bufferWriter.writeUint32LE(this.positionX);
        this.bufferWriter.writeUint32LE(this.positionY);
        return this.bufferWriter.getBuffer();
    }
}
