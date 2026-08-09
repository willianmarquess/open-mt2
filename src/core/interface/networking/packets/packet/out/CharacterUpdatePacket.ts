import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name CharacterUpdatePacket
 * @header 0x13
 * @size 35
 * @description Is used to send the updated state of an already spawned character to nearby players. The equipment part is repeated 4x and the affect flag 2x.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {int} vid 4 Character identification in game
 *   - {short[4]} parts 8 Equipment parts (armor, weapon, head, hair)
 *   - {byte} moveSpeed 1 Movement speed of character
 *   - {byte} attackSpeed 1 Attack speed of character
 *   - {byte} state 1 State flag of character
 *   - {int[2]} affects 8 Affect flags of character
 *   - {int} guildId 4 Id of guild
 *   - {short} rankPoints 2 Rank points
 *   - {byte} pkMode 1 If pk is enable
 *   - {int} mountVnum 4 Vnum of mount
 */

export default class CharacterUpdatePacket extends PacketOut {
    private readonly vid: number;
    private readonly parts: Array<number> = new Array(4).fill(0);
    private readonly moveSpeed: number = 0;
    private readonly attackSpeed: number = 0;
    private readonly state: number = 0;
    private readonly affects: Array<number> = new Array(2).fill(0);
    private readonly guildId: number = 0;
    private readonly rankPoints: number = 0;
    private readonly pkMode: number = 0;
    private readonly mountVnum: number = 0;

    constructor({
        vid,
        parts,
        moveSpeed,
        attackSpeed,
        state,
        affects,
        guildId,
        rankPoints,
        pkMode,
        mountVnum,
    }: {
        vid: number;
        parts: Array<number>;
        moveSpeed: number;
        attackSpeed: number;
        state: number;
        affects: Array<number>;
        guildId: number;
        rankPoints: number;
        pkMode: number;
        mountVnum: number;
    }) {
        super({
            header: PacketHeaderEnum.CHARACTER_UPDATE,
            name: 'CharacterUpdatePacket',
            size: 35,
        });
        this.vid = vid;
        this.parts = parts ?? this.parts;
        this.moveSpeed = moveSpeed ?? this.moveSpeed;
        this.attackSpeed = attackSpeed ?? this.attackSpeed;
        this.state = state ?? this.state;
        this.affects = affects ?? this.affects;
        this.guildId = guildId ?? this.guildId;
        this.rankPoints = rankPoints ?? this.rankPoints;
        this.pkMode = pkMode ?? this.pkMode;
        this.mountVnum = mountVnum ?? this.mountVnum;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.vid);
        this.parts.forEach((part) => this.bufferWriter.writeUint16LE(part));
        this.bufferWriter.writeUint8(this.moveSpeed);
        this.bufferWriter.writeUint8(this.attackSpeed);
        this.bufferWriter.writeUint8(this.state);
        this.affects.forEach((affect) => this.bufferWriter.writeUint32LE(affect));
        this.bufferWriter.writeUint32LE(this.guildId);
        this.bufferWriter.writeUint16LE(this.rankPoints);
        this.bufferWriter.writeUint8(this.pkMode);
        this.bufferWriter.writeUint32LE(this.mountVnum);

        return this.bufferWriter.getBuffer();
    }
}
