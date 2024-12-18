import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

type CharacterParams = {
    id: number;
    name: string;
    playerClass: number;
    level: number;
    playTime: number;
    st: number;
    ht: number;
    dx: number;
    iq: number;
    bodyPart: number;
    nameChange: number;
    hairPart: number;
    positionX: number;
    positionY: number;
    ip: number;
    port: number;
    skillGroup: number;
};

type CreateCharacterSuccessPacketParams = {
    slot?: number;
    character?: CharacterParams;
};

const defaultCharacterInfo: CharacterParams = {
    id: 0,
    name: '',
    playerClass: 0,
    level: 0,
    playTime: 0,
    st: 0,
    ht: 0,
    dx: 0,
    iq: 0,
    bodyPart: 0,
    nameChange: 0,
    hairPart: 0,
    positionX: 0,
    positionY: 0,
    ip: 0,
    port: 0,
    skillGroup: 0,
};

export default class CreateCharacterSuccessPacket extends PacketOut {
    private slot: number;
    private character: CharacterParams;

    constructor({ slot, character = defaultCharacterInfo }: CreateCharacterSuccessPacketParams = {}) {
        super({
            header: PacketHeaderEnum.CREATE_CHARACTER_SUCCESS,
            name: 'CreateCharacterSuccessPacket',
            size: 65,
        });
        this.slot = slot;
        this.character = character;
    }

    pack() {
        this.bufferWriter.writeUint8(this.slot);
        this.bufferWriter.writeUint32LE(this.character.id);
        this.bufferWriter.writeString(this.character.name, 25);
        this.bufferWriter.writeUint8(this.character.playerClass);
        this.bufferWriter.writeUint8(this.character.level);
        this.bufferWriter.writeUint32LE(this.character.playTime);
        this.bufferWriter.writeUint8(this.character.st);
        this.bufferWriter.writeUint8(this.character.ht);
        this.bufferWriter.writeUint8(this.character.dx);
        this.bufferWriter.writeUint8(this.character.iq);
        this.bufferWriter.writeUint16LE(this.character.bodyPart);
        this.bufferWriter.writeUint8(this.character.nameChange);
        this.bufferWriter.writeUint16LE(this.character.hairPart);
        this.bufferWriter.writeUint32LE(0);
        this.bufferWriter.writeUint32LE(this.character.positionX);
        this.bufferWriter.writeUint32LE(this.character.positionY);
        this.bufferWriter.writeUint32LE(this.character.ip);
        this.bufferWriter.writeUint16LE(this.character.port);
        this.bufferWriter.writeUint8(this.character.skillGroup);

        return this.bufferWriter.getBuffer();
    }
}
