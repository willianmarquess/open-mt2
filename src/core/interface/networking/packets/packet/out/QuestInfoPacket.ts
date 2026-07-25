import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

type QuestInfoPacketParams = {
    id: number;
    flags: number;
    wasStarted: number;
    title: string;
    clockName?: string;
    clockValue?: number;
    counterName?: string;
    counterValue?: number;
    iconFile?: string;
};

const BASIC_SIZE = 6;
const FULL_FIZE = BASIC_SIZE + 99;

export default class QuestInfoPacket extends PacketOut {
    private readonly id: number;
    private readonly flags: number;
    private readonly wasStated: number;
    private readonly title: string;
    private readonly clockName?: string;
    private readonly clockValue?: number;
    private readonly counterName?: string;
    private readonly counterValue?: number;
    private readonly iconFile?: string;

    constructor({
        id,
        flags,
        wasStarted,
        title,
        clockName,
        clockValue,
        counterName,
        counterValue,
        iconFile,
    }: QuestInfoPacketParams) {
        super({
            header: PacketHeaderEnum.QUEST_INFO,
            name: 'QuestInfoPacket',
            size: FULL_FIZE,
        });

        this.id = id;
        this.flags = flags;
        this.wasStated = wasStarted;
        this.title = title;
        this.clockName = clockName;
        this.clockValue = clockValue;
        this.counterName = counterName;
        this.counterValue = counterValue;
        this.iconFile = iconFile;
    }

    pack() {
        this.bufferWriter.writeUint16LE(this.size);
        this.bufferWriter.writeUint16LE(this.id);
        this.bufferWriter.writeUint8(this.flags);
        let totalSize = BASIC_SIZE;

        if (this.wasStated === 0 || this.wasStated === 1) {
            this.bufferWriter.writeUint8(this.wasStated);
            totalSize += 1;
        }

        if (this.title) {
            this.bufferWriter.writeString(this.title, 32);
            totalSize += 32;
        }

        if (this.clockName) {
            this.bufferWriter.writeString(this.clockName, 17);
            totalSize += 17;
        }

        if (this.clockValue) {
            this.bufferWriter.writeUint32LE(this.clockValue);
            totalSize += 4;
        }

        if (this.counterName) {
            this.bufferWriter.writeString(this.counterName, 17);
            totalSize += 17;
        }

        if (this.counterValue) {
            this.bufferWriter.writeUint32LE(this.counterValue);
            totalSize += 4;
        }

        if (this.iconFile) {
            this.bufferWriter.writeString(this.iconFile, 25);
            totalSize += 25;
        }

        return this.bufferWriter.getBuffer(totalSize);
    }
}
