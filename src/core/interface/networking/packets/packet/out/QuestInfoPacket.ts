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

/**
 * @packet
 * @type Out
 * @name QuestInfoPacket
 * @header 0x51
 * @size 105
 * @description Used to send the state of a quest to the client quest window. The 6 byte head is always written, every field after the flag byte is optional and is only written when its bit is set in the flag, so the packet on the wire is between 6 and 105 bytes. The widths below are the maximum case, with every optional field present.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {short} size 2 Total size in bytes of this packet
 *   - {short} id 2 Index of the quest this info belongs to
 *   - {byte} flags 1 Bitmask telling which of the optional fields below follow. See QuestFlagEnum.
 *   - {byte} wasStarted 1 Optional (ISBEGIN). 1 when the quest begins, 0 when it ends.
 *   - {string} title 31 Optional (TITLE). Quest title (ascii).
 *   - {string} clockName 17 Optional (CLOCK_NAME). Label of the quest clock (ascii).
 *   - {int} clockValue 4 Optional (CLOCK_VALUE). Value shown in the quest clock.
 *   - {string} counterName 17 Optional (COUNTER_NAME). Label of the quest counter (ascii).
 *   - {int} counterValue 4 Optional (COUNTER_VALUE). Value shown in the quest counter.
 *   - {string} iconFile 25 Optional (ICON_FILE). File name of the quest icon (ascii).
 */

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

    // ISBEGIN is semantic (begin/end vs update), so it is honored from the
    // caller's flags; every other bit is derived from field presence so the
    // flag byte can never disagree with the payload.
    private getFieldsToSend() {
        const fields = [
            {
                present: (this.flags & QuestFlagEnum.ISBEGIN) !== 0,
                bit: QuestFlagEnum.ISBEGIN,
                size: IS_BEGIN_SIZE,
                write: () => this.bufferWriter.writeUint8(this.wasStated ? 1 : 0),
            },
            {
                present: Boolean(this.title),
                bit: QuestFlagEnum.TITLE,
                size: TITLE_SIZE,
                write: () => this.bufferWriter.writeString(this.title, TITLE_SIZE),
            },
            {
                present: Boolean(this.clockName),
                bit: QuestFlagEnum.CLOCK_NAME,
                size: CLOCK_NAME_SIZE,
                write: () => this.bufferWriter.writeString(this.clockName!, CLOCK_NAME_SIZE),
            },
            {
                present: this.clockValue !== undefined,
                bit: QuestFlagEnum.CLOCK_VALUE,
                size: INT_SIZE,
                write: () => this.bufferWriter.writeUint32LE(this.clockValue!),
            },
            {
                present: Boolean(this.counterName),
                bit: QuestFlagEnum.COUNTER_NAME,
                size: COUNTER_NAME_SIZE,
                write: () => this.bufferWriter.writeString(this.counterName!, COUNTER_NAME_SIZE),
            },
            {
                present: this.counterValue !== undefined,
                bit: QuestFlagEnum.COUNTER_VALUE,
                size: INT_SIZE,
                write: () => this.bufferWriter.writeUint32LE(this.counterValue!),
            },
            {
                present: Boolean(this.iconFile),
                bit: QuestFlagEnum.ICON_FILE,
                size: ICON_FILE_SIZE,
                write: () => this.bufferWriter.writeString(this.iconFile!, ICON_FILE_SIZE),
            },
        ];

        return fields.filter((field) => field.present);
    }

    pack() {
        const fields = this.getFieldsToSend();
        const totalSize = fields.reduce((size, field) => size + field.size, BASIC_SIZE);
        const flags = fields.reduce((bits, field) => bits | field.bit, 0);

        this.bufferWriter.writeUint16LE(totalSize);
        this.bufferWriter.writeUint16LE(this.id);
        this.bufferWriter.writeUint8(flags);

        for (const field of fields) {
            field.write();
        }

        return this.bufferWriter.getBuffer(totalSize);
    }
}
