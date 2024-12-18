import { PacketHeaderEnum } from "@/core/enum/PacketHeaderEnum";
import PacketOut from "@/core/interface/networking/packets/packet/out/PacketOut"

type DamagePacketParams = {
    virtualId?: number,
    damageFlags?: number,
    damage?: number,
}

/**
 * @packet
 * @type Out
 * @name DamagePacket
 * @header 0x87
 * @size 10
 * @description Used to send the damage to client.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {number} virtualId 4 virtualId of the affected entity
 *   - {byte} damageFlags 1 indicates the flags of damage like: critical, pierced etc //TODO
 *   - {number} damage 4 the damage number
 */

export default class DamagePacket extends PacketOut {
    private virtualId: number;
    private damageFlags: number;
    private damage: number;

    constructor({ virtualId, damageFlags, damage }: DamagePacketParams = {}) {
        super({
            header: PacketHeaderEnum.DAMAGE,
            name: 'DamagePacket',
            size: 10,
        });
        this.virtualId = virtualId;
        this.damageFlags = damageFlags;
        this.damage = damage;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.virtualId);
        this.bufferWriter.writeUint8(this.damageFlags);
        this.bufferWriter.writeUint32LE(this.damage);
        return this.bufferWriter.getBuffer();
    }
}
