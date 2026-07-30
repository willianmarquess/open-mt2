const SEQUENCE_BYTE_LENGTH = 1;
const SYNC_POSITION_HEADER = 0x08;
const SYNC_POSITION_FIXED_SIZE = 3;

/** On-wire length, or null while the buffer is too short to tell. */
type FrameLengthResolver = (buffer: Buffer) => number | null;

/** The client's wSize covers header + wSize + elements, but not the sequence byte after it. */
const syncPositionFrameLength: FrameLengthResolver = (buffer) => {
    if (buffer.byteLength < SYNC_POSITION_FIXED_SIZE) return null;
    return buffer.readUInt16LE(1) + SEQUENCE_BYTE_LENGTH;
};

const unimplementedPackets = new Map<number, FrameLengthResolver>([[SYNC_POSITION_HEADER, syncPositionFrameLength]]);

export const isUnimplementedHeader = (header: number) => unimplementedPackets.has(header);

export const unimplementedFrameLength = (header: number, buffer: Buffer) =>
    unimplementedPackets.get(header)?.(buffer) ?? null;
