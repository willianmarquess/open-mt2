import PacketIn from '../PacketIn';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import FlyTargetingRequestPacketValidator from './FlyTargetingRequestPacketValidator';

/**
 * @packet
 * @type In
 * @name FlyTargetingRequestPacket
 * @header 0x33
 * @size 13
 * @description Mirrors TPacketCGFlyTargeting (packet.h): the client declares (or replaces) the single target it is currently aiming a ranged skill at, ahead of the Shoot packet that fires it. `targetVirtualId` is 0 when the client is aiming at bare ground rather than an entity, in which case `positionX`/`positionY` carry the aim point instead (see CHARACTER::FlyTarget, char_battle.cpp:3008).
 * @fields
 *   - {byte} header 1 Packet header
 *   - {number} targetVirtualId 4 Entity being aimed at, or 0 for a ground-targeted aim point
 *   - {number} positionX 4 Aim point X, used when targetVirtualId is 0
 *   - {number} positionY 4 Aim point Y, used when targetVirtualId is 0
 */
export default class FlyTargetingRequestPacket extends PacketIn {
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
            header: PacketHeaderEnum.FLY_TARGETING_REQUEST,
            name: 'FlyTargetingRequestPacket',
            size: 13,
            validator: FlyTargetingRequestPacketValidator,
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
