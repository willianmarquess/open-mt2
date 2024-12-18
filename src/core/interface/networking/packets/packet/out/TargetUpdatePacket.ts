import { PacketHeaderEnum } from "@/core/enum/PacketHeaderEnum";
import PacketOut from "@/core/interface/networking/packets/packet/out/PacketOut"

/**
 * @packet
 * @type Out
 * @name TargetUpdatedPacket
 * @header 0x3f
 * @size 6
 * @description Used to send the target to client.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {number} virtualId 4 virtualId of the target entity
 *   - {byte} healthPercentage 1 indicates the percent of target entity health
 */

type TargetUpdatedPacketParams = {
    virtualId?: number,
    healthPercentage?: number
}

export default class TargetUpdatedPacket extends PacketOut {
    private virtualId: number;
    private healthPercentage: number;

    constructor({ virtualId, healthPercentage }: TargetUpdatedPacketParams = {}) {
        super({
            header: PacketHeaderEnum.TARGET_UPDATED,
            name: 'TargetUpdatedPacket',
            size: 6,
        });
        this.virtualId = virtualId;
        this.healthPercentage = healthPercentage;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.virtualId);
        this.bufferWriter.writeUint8(this.healthPercentage);
        return this.bufferWriter.getBuffer();
    }
}
