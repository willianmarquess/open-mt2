import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

const PLAYER_NAME_MAX_LENGTH = 25;

/**
 * @packet
 * @type Out
 * @name SetItemOwnershipPacket
 * @header 0x1f
 * @size 30
 * @description Marks a dropped ground item as owned by a player, so only that player may loot it while the ownership lasts. Matches the client struct TPacketGCItemOwnership.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {int} virtualId 4 Virtual id of the ground item the ownership applies to
 *   - {string} ownerName 25 Name of the owning player (ascii, null terminated), empty clears the ownership
 */

export default class SetItemOwnershipPacket extends PacketOut {
    private readonly virtualId: number;
    private readonly ownerName: string;

    constructor({ ownerName, virtualId }: { ownerName: string; virtualId: number }) {
        super({
            header: PacketHeaderEnum.SET_ITEM_OWNERSHIP,
            name: 'SetItemOwnershipPacket',
            size: 5 + PLAYER_NAME_MAX_LENGTH,
        });
        this.virtualId = virtualId;
        this.ownerName = ownerName || '\0';
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.virtualId);
        this.bufferWriter.writeString(this.ownerName, PLAYER_NAME_MAX_LENGTH);
        return this.bufferWriter.getBuffer();
    }
}
