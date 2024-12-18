import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

type CharacterSpawnPacketParams = {
    vid?: number;
    rotation?: number;
    positionX?: number;
    positionY?: number;
    positionZ?: number;
    entityType?: number;
    playerClass?: number;
    movementSpeed?: number;
    attackSpeed?: number;
    state?: number;
    affects?: Array<number>;
};

export default class CharacterSpawnPacket extends PacketOut {
    private vid: number;
    private rotation: number = 0;
    private positionX: number;
    private positionY: number;
    private positionZ: number;
    private entityType: number;
    private playerClass: number;
    private movementSpeed: number;
    private attackSpeed: number;
    private state: number = 0;
    private affects: Array<number> = new Array(2).fill(0);

    constructor({
        vid,
        rotation,
        positionX,
        positionY,
        positionZ,
        entityType,
        playerClass,
        movementSpeed,
        attackSpeed,
        state,
        affects,
    }: CharacterSpawnPacketParams = {}) {
        super({
            header: PacketHeaderEnum.CHARACTER_SPAWN,
            name: 'CharacterSpawnPacket',
            size: 35,
        });
        this.vid = vid;
        this.rotation = rotation ?? this.rotation;
        this.positionX = positionX;
        this.positionY = positionY;
        this.positionZ = positionZ;
        this.entityType = entityType;
        this.playerClass = playerClass;
        this.movementSpeed = movementSpeed;
        this.attackSpeed = attackSpeed;
        this.state = state ?? this.state;
        this.affects = affects ?? this.affects;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.vid);
        this.bufferWriter.writeFloatLE(this.rotation);
        this.bufferWriter.writeUint32LE(this.positionX);
        this.bufferWriter.writeUint32LE(this.positionY);
        this.bufferWriter.writeUint32LE(this.positionZ);
        this.bufferWriter.writeUint8(this.entityType);
        this.bufferWriter.writeUint16LE(this.playerClass);
        this.bufferWriter.writeUint8(this.movementSpeed);
        this.bufferWriter.writeUint8(this.attackSpeed);
        this.bufferWriter.writeUint8(this.state);
        this.affects.forEach((affect) => this.bufferWriter.writeUint32LE(affect));

        return this.bufferWriter.getBuffer();
    }
}
