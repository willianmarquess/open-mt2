import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import CreateCharacterPacketValidator from './CreateCharacterPacketValidator';

export default class CreateCharacterPacket extends PacketIn {
    private slot: number;
    private playerName: string;
    private playerClass: number;
    private appearance: number;

    constructor({
        slot,
        playerName,
        playerClass,
        appearance,
    }: {
        slot: number;
        playerName: string;
        playerClass: number;
        appearance: number;
    }) {
        super({
            header: PacketHeaderEnum.CREATE_CHARACTER,
            name: 'CreateCharacterPacket',
            size: 30,
            validator: CreateCharacterPacketValidator,
        });
        this.slot = slot;
        this.playerName = playerName;
        this.playerClass = playerClass;
        this.appearance = appearance;
    }

    // Newer builds append stat bytes after appearance, so claim the whole read.
    getFrameLength(buffer: Buffer): number | null {
        return buffer.byteLength >= this.size ? buffer.byteLength : null;
    }

    getSlot() {
        return this.slot;
    }

    getPlayerName() {
        return this.playerName;
    }

    getPlayerClass() {
        return this.playerClass;
    }

    getAppearance() {
        return this.appearance;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.slot = this.bufferReader.readUInt8();
        this.playerName = this.bufferReader.readString(25);
        this.playerClass = this.bufferReader.readUInt16LE();
        this.appearance = this.bufferReader.readUInt8();
        this.validate();
        return this;
    }
}
