const SEQUENCE_BYTE_LENGTH = 1;
const SYNC_POSITION_HEADER = 0x08;
const SYNC_POSITION_FIXED_SIZE = 3;

const FLY_TARGETING_HEADER = 51;
const USE_SKILL_HEADER = 52;
const ADD_FLY_TARGETING_HEADER = 53;
const SHOOT_HEADER = 54;
const PARTY_USE_SKILL_HEADER = 76;

const FLY_TARGETING_STRUCT_SIZE = 13;
const USE_SKILL_STRUCT_SIZE = 9;
const SHOOT_STRUCT_SIZE = 2;
const PARTY_USE_SKILL_STRUCT_SIZE = 6;

/** On-wire length, or null while the buffer is too short to tell. */
type FrameLengthResolver = (buffer: Buffer) => number | null;

/** The client's wSize covers header + wSize + elements, but not the sequence byte after it. */
const syncPositionFrameLength: FrameLengthResolver = (buffer) => {
    if (buffer.byteLength < SYNC_POSITION_FIXED_SIZE) return null;
    return buffer.readUInt16LE(1) + SEQUENCE_BYTE_LENGTH;
};

const fixedFrameLength =
    (structSize: number): FrameLengthResolver =>
    () =>
        structSize + SEQUENCE_BYTE_LENGTH;

const unimplementedPackets = new Map<number, FrameLengthResolver>([
    [SYNC_POSITION_HEADER, syncPositionFrameLength],
    [FLY_TARGETING_HEADER, fixedFrameLength(FLY_TARGETING_STRUCT_SIZE)],
    [USE_SKILL_HEADER, fixedFrameLength(USE_SKILL_STRUCT_SIZE)],
    [ADD_FLY_TARGETING_HEADER, fixedFrameLength(FLY_TARGETING_STRUCT_SIZE)],
    [SHOOT_HEADER, fixedFrameLength(SHOOT_STRUCT_SIZE)],
    [PARTY_USE_SKILL_HEADER, fixedFrameLength(PARTY_USE_SKILL_STRUCT_SIZE)],
]);

export const isUnimplementedHeader = (header: number) => unimplementedPackets.has(header);

export const unimplementedFrameLength = (header: number, buffer: Buffer) =>
    unimplementedPackets.get(header)?.(buffer) ?? null;
