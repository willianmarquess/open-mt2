import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import { QuestFlagEnum } from '@/core/enum/QuestSendFlagEnum';
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
const FULL_SIZE = BASIC_SIZE + 99;

// Field sizes mirror the client's RecvQuestInfoPacket buffers exactly:
// char szTitle[30+1], char szClockName[16+1], int, char szCounterName[16+1],
// int, char szIconFileName[24+1]. The client consumes each field only when the
// matching flag bit is set, so what gets flagged and what gets written must
// always agree or the stream desynchronizes.
const IS_BEGIN_SIZE = 1;
const TITLE_SIZE = 31;
const CLOCK_NAME_SIZE = 17;
const COUNTER_NAME_SIZE = 17;
const ICON_FILE_SIZE = 25;
const INT_SIZE = 4;

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
            size: FULL_SIZE,
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
        // ISBEGIN is semantic (begin/end vs update), so it is honored from the
        // caller's flags; every other bit is derived from field presence so the
        // flag byte can never disagree with the payload.
        const sendIsBegin = (this.flags & QuestFlagEnum.ISBEGIN) !== 0;
        const sendTitle = Boolean(this.title);
        const sendClockName = Boolean(this.clockName);
        const sendClockValue = this.clockValue !== undefined;
        const sendCounterName = Boolean(this.counterName);
        const sendCounterValue = this.counterValue !== undefined;
        const sendIconFile = Boolean(this.iconFile);

        let flags = 0;
        let totalSize = BASIC_SIZE;

        if (sendIsBegin) {
            flags |= QuestFlagEnum.ISBEGIN;
            totalSize += IS_BEGIN_SIZE;
        }
        if (sendTitle) {
            flags |= QuestFlagEnum.TITLE;
            totalSize += TITLE_SIZE;
        }
        if (sendClockName) {
            flags |= QuestFlagEnum.CLOCK_NAME;
            totalSize += CLOCK_NAME_SIZE;
        }
        if (sendClockValue) {
            flags |= QuestFlagEnum.CLOCK_VALUE;
            totalSize += INT_SIZE;
        }
        if (sendCounterName) {
            flags |= QuestFlagEnum.COUNTER_NAME;
            totalSize += COUNTER_NAME_SIZE;
        }
        if (sendCounterValue) {
            flags |= QuestFlagEnum.COUNTER_VALUE;
            totalSize += INT_SIZE;
        }
        if (sendIconFile) {
            flags |= QuestFlagEnum.ICON_FILE;
            totalSize += ICON_FILE_SIZE;
        }

        this.bufferWriter.writeUint16LE(totalSize);
        this.bufferWriter.writeUint16LE(this.id);
        this.bufferWriter.writeUint8(flags);

        if (sendIsBegin) {
            this.bufferWriter.writeUint8(this.wasStated ? 1 : 0);
        }
        if (sendTitle) {
            this.bufferWriter.writeString(this.title, TITLE_SIZE);
        }
        if (sendClockName) {
            this.bufferWriter.writeString(this.clockName!, CLOCK_NAME_SIZE);
        }
        if (sendClockValue) {
            this.bufferWriter.writeUint32LE(this.clockValue!);
        }
        if (sendCounterName) {
            this.bufferWriter.writeString(this.counterName!, COUNTER_NAME_SIZE);
        }
        if (sendCounterValue) {
            this.bufferWriter.writeUint32LE(this.counterValue!);
        }
        if (sendIconFile) {
            this.bufferWriter.writeString(this.iconFile!, ICON_FILE_SIZE);
        }

        return this.bufferWriter.getBuffer(totalSize);
    }
}
