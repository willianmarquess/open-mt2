import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

type CharacterUpdatePacketParams = {
    vid?: number;
    parts?: Array<number>;
    moveSpeed?: number;
    attackSpeed?: number;
    state?: number;
    affects?: Array<number>;
    guildId?: number;
    rankPoints?: number;
    pkMode?: number;
    mountVnum?: number;
};

export default class CharacterUpdatePacket extends PacketOut {
    private vid: number;
    private parts: Array<number> = new Array(4).fill(0);
    private moveSpeed: number = 0;
    private attackSpeed: number = 0;
    private state: number = 0;
    private affects: Array<number> = new Array(2).fill(0);
    private guildId: number = 0;
    private rankPoints: number = 0;
    private pkMode: number = 0;
    private mountVnum: number = 0;

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
    }: CharacterUpdatePacketParams = {}) {
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
