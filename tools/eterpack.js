/**
 * Minimal read-only EterPack (.eix/.epk) access, enough to pull map data out
 * of the client the server is developed against. Formats ported from the
 * client source (EterPack.cpp, EterBase/lzo.cpp, EterBase/tea.cpp):
 *
 *   .eix  MCOZ container -> 'EPKD' + version(2) + count + count * 192-byte entries
 *   .epk  per-entry data at data_position; compressed_type 0 = raw,
 *         1 = MCOZ, 2 = MCOZ encrypted with the security key
 *   MCOZ  { 'MCOZ', encryptSize, compressedSize, realSize } + 'MCOZ' + lzo1x
 *         stream (TEA-encrypted over [fourCC + stream] when encryptSize > 0)
 *
 * The TEA keys below are the stock keys from the client source tree - they
 * only ever decode files the developer already has on disk.
 */
import fs from 'node:fs';
import { Buffer } from 'node:buffer';

const PACK_KEY = new Uint32Array([45129401, 92367215, 681285731, 1710201]);
const SECURITY_KEY = new Uint32Array([78952482, 527348324, 1632942, 486274726]);
const DELTA = 0x9e3779b9;
const ROUNDS = 32;
const INDEX_ENTRY_SIZE = 192;

function teaDecodeBlock(z, y, key) {
    let sum = (DELTA * ROUNDS) >>> 0;
    for (let n = 0; n < ROUNDS; n++) {
        z = (z - ((((y << 4) ^ (y >>> 5)) + y) ^ ((sum + key[(sum >>> 11) & 3]) >>> 0))) >>> 0;
        sum = (sum - DELTA) >>> 0;
        y = (y - ((((z << 4) ^ (z >>> 5)) + z) ^ ((sum + key[sum & 3]) >>> 0))) >>> 0;
    }
    return [y, z];
}

function teaDecrypt(src, key, size) {
    const resize = size % 8 === 0 ? size : size + 8 - (size % 8);
    const out = Buffer.alloc(resize);
    for (let i = 0; i + 8 <= resize; i += 8) {
        // tea_decode(*(src + 1), *src, ...): the second dword is z, the first is y.
        const y0 = src.readUInt32LE(i);
        const z0 = i + 8 <= src.length ? src.readUInt32LE(i + 4) : 0;
        const [y, z] = teaDecodeBlock(z0, y0, key);
        out.writeUInt32LE(y, i);
        out.writeUInt32LE(z, i + 4);
    }
    return out;
}

/** lzo1x_decompress ported from the reference algorithm. */
function lzo1xDecompress(src, outLen) {
    const out = Buffer.alloc(outLen);
    let ip = 0;
    let op = 0;
    let t;
    let mPos = 0;
    let state = 'begin';

    const copyMatch = (len) => {
        for (let i = 0; i < len; i++) out[op++] = out[mPos++];
    };

    t = src[ip++];
    if (t > 17) {
        t -= 17;
        if (t < 4) {
            state = 'matchNext';
        } else {
            src.copy(out, op, ip, ip + t);
            op += t;
            ip += t;
            state = 'firstLiteralRun';
        }
    }

    for (;;) {
        switch (state) {
            case 'begin': {
                t = src[ip++];
                if (t >= 16) {
                    state = 'match';
                    break;
                }
                if (t === 0) {
                    while (src[ip] === 0) {
                        t += 255;
                        ip++;
                    }
                    t += 15 + src[ip++];
                }
                src.copy(out, op, ip, ip + t + 3);
                op += t + 3;
                ip += t + 3;
                state = 'firstLiteralRun';
                break;
            }

            case 'firstLiteralRun': {
                t = src[ip++];
                if (t >= 16) {
                    state = 'match';
                    break;
                }
                mPos = op - (1 + 0x0800);
                mPos -= t >> 2;
                mPos -= src[ip++] << 2;
                copyMatch(3);
                state = 'matchDone';
                break;
            }

            case 'match': {
                if (t >= 64) {
                    mPos = op - 1;
                    mPos -= (t >> 2) & 7;
                    mPos -= src[ip++] << 3;
                    t = (t >> 5) - 1;
                    copyMatch(t + 2);
                    state = 'matchDone';
                    break;
                }
                if (t >= 32) {
                    t &= 31;
                    if (t === 0) {
                        while (src[ip] === 0) {
                            t += 255;
                            ip++;
                        }
                        t += 31 + src[ip++];
                    }
                    mPos = op - 1;
                    mPos -= (src[ip] >> 2) + (src[ip + 1] << 6);
                    ip += 2;
                    copyMatch(t + 2);
                    state = 'matchDone';
                    break;
                }
                if (t >= 16) {
                    mPos = op - ((t & 8) << 11);
                    t &= 7;
                    if (t === 0) {
                        while (src[ip] === 0) {
                            t += 255;
                            ip++;
                        }
                        t += 7 + src[ip++];
                    }
                    mPos -= (src[ip] >> 2) + (src[ip + 1] << 6);
                    ip += 2;
                    if (mPos === op) {
                        // end-of-stream marker
                        if (op !== outLen) throw new Error(`lzo1x: produced ${op} bytes, expected ${outLen}`);
                        return out;
                    }
                    mPos -= 0x4000;
                    copyMatch(t + 2);
                    state = 'matchDone';
                    break;
                }
                mPos = op - 1;
                mPos -= t >> 2;
                mPos -= src[ip++] << 2;
                copyMatch(2);
                state = 'matchDone';
                break;
            }

            case 'matchDone': {
                t = src[ip - 2] & 3;
                state = t === 0 ? 'begin' : 'matchNext';
                break;
            }

            case 'matchNext': {
                src.copy(out, op, ip, ip + t);
                op += t;
                ip += t;
                t = src[ip++];
                state = 'match';
                break;
            }
        }
    }
}

function mcozDecode(buffer, key) {
    if (buffer.toString('latin1', 0, 4) !== 'MCOZ') throw new Error('not an MCOZ container');
    const encryptSize = buffer.readUInt32LE(4);
    const compressedSize = buffer.readUInt32LE(8);
    const realSize = buffer.readUInt32LE(12);

    let stream;
    if (encryptSize > 0) {
        const decrypted = teaDecrypt(buffer.subarray(16, 16 + encryptSize), key, encryptSize);
        if (decrypted.toString('latin1', 0, 4) !== 'MCOZ') throw new Error('bad key (post-decrypt fourcc)');
        stream = decrypted.subarray(4, 4 + compressedSize);
    } else {
        stream = buffer.subarray(20, 20 + compressedSize);
    }

    return lzo1xDecompress(stream, realSize);
}

/** Parses a .eix file into { filename, realSize, dataSize, position, type } entries. */
export function readPackIndex(eixPath) {
    const raw = fs.readFileSync(eixPath);
    const fourcc = raw.toString('latin1', 0, 4);

    let data;
    if (fourcc === 'EPKD') data = raw;
    else if (fourcc === 'MCOZ') data = mcozDecode(raw, PACK_KEY);
    else throw new Error(`${eixPath}: unknown fourcc ${fourcc}`);

    if (data.toString('latin1', 0, 4) !== 'EPKD') throw new Error(`${eixPath}: bad index magic`);
    const version = data.readUInt32LE(4);
    if (version !== 2) throw new Error(`${eixPath}: unsupported index version ${version}`);
    const count = data.readInt32LE(8);

    const entries = [];
    for (let i = 0; i < count; i++) {
        const off = 12 + i * INDEX_ENTRY_SIZE;
        entries.push({
            filename: data
                .toString('latin1', off + 4, off + 165)
                .split('\0')[0]
                .replaceAll('\\', '/'),
            realSize: data.readInt32LE(off + 172),
            dataSize: data.readInt32LE(off + 176),
            position: data.readInt32LE(off + 184),
            type: data.readUInt8(off + 188),
        });
    }
    return entries;
}

/** Reads and decodes one index entry from an open .epk file descriptor. */
export function readPackEntry(epkFd, entry) {
    const buffer = Buffer.alloc(entry.dataSize);
    fs.readSync(epkFd, buffer, 0, entry.dataSize, entry.position);

    switch (entry.type) {
        case 0:
            return buffer;
        case 1:
            return mcozDecode(buffer, PACK_KEY);
        case 2:
            return mcozDecode(buffer, SECURITY_KEY);
        default:
            throw new Error(`${entry.filename}: unsupported compressed_type ${entry.type}`);
    }
}
