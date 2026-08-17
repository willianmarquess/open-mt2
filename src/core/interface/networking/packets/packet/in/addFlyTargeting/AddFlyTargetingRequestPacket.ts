import PacketIn from '../PacketIn';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import AddFlyTargetingRequestPacketValidator from './AddFlyTargetingRequestPacketValidator';

/**
 * @packet
 * @type In
 * @name AddFlyTargetingRequestPacket
 * @header 0x35
 * @size 13
 * @description Mirrors TPacketCGFlyTargeting sent with header HEADER_CG_ADD_FLY_TARGETING (packet.h): same layout as FlyTargetingRequestPacket, but appends another target to the pending Shoot queue instead of replacing it - used by multi-shot skills that hit several targets from one release (see CHARACTER::FlyTarget pushing into m_vec_dwFlyTargets, char_battle.cpp:3008).
 * @fields
 *   - {byte} header 1 Packet header
 *   - {number} targetVirtualId 4 Entity being added to the shot queue, or 0 for a ground-targeted aim point
 *   - {number} positionX 4 Aim point X, used when targetVirtualId is 0
 *   - {number} positionY 4 Aim point Y, used when targetVirtualId is 0
 */
export default class AddFlyTargetingRequestPacket extends PacketIn {
    private targetVirtualId: number;
    private positionX: number;
    private positionY: number;

    constructor({
        targetVirtualId,
        positionX,
        positionY,
    }: {
        targetVirtualId: number;
        positionX: number;
        positionY: number;
    }) {
        super({
            header: PacketHeaderEnum.ADD_FLY_TARGETING_REQUEST,
            name: 'AddFlyTargetingRequestPacket',
            size: 13,
            validator: AddFlyTargetingRequestPacketValidator,
        });
        this.targetVirtualId = targetVirtualId;
        this.positionX = positionX;
        this.positionY = positionY;
    }

    getTargetVirtualId() {
        return this.targetVirtualId;
    }
    getPositionX() {
        return this.positionX;
    }
    getPositionY() {
        return this.positionY;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.targetVirtualId = this.bufferReader.readUInt32LE();
        this.positionX = this.bufferReader.readUInt32LE();
        this.positionY = this.bufferReader.readUInt32LE();
        this.validate();
        return this;
    }
}
