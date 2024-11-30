import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

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

export default class TargetUpdatedPacket extends PacketOut {
    #virtualId;
    #healthPercentage;

    constructor({ virtualId, healthPercentage } = {}) {
        super({
            header: PacketHeaderEnum.TARGET_UPDATED,
            name: 'TargetUpdatedPacket',
            size: 6,
        });
        this.#virtualId = virtualId;
        this.#healthPercentage = healthPercentage;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.#virtualId);
        this.bufferWriter.writeUint8(this.#healthPercentage);
        return this.bufferWriter.buffer;
    }
}
