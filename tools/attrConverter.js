/**
 * Converts client-side map attribute data (attr.atr) into the server's
 * per-map attribute grids (<mapName>.attr.gz) consumed by MapAttributeGrid.
 *
 * The client stores one attr.atr per 256m x 256m map section, in folders named
 * printf("%06u", sectionX * 1000 + sectionY):
 *   WORD magic (2634), WORD width (256), WORD height (256),
 *   followed by 256 * 256 bytes, one attribute byte per 1m cell
 *   (BLOCK = 1, WATER = 2, BANPK = 4 - same values the server uses).
 *
 * Usage - read straight from the client packs (no manual unpacking needed):
 *   node tools/attrConverter.js --packs <client pack dir> [--out <dir>]
 *
 * Usage - read from already-extracted map folders:
 *   node tools/attrConverter.js --maps <unpacked client maps root> [--out <dir>]
 *
 * Maps listed in atlasinfo.json without client data are skipped - the server
 * falls back to an empty grid for them.
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { readPackIndex, readPackEntry } from './eterpack.js';

const SECTION_CELLS = 256; // 256 cells of 1m per section side
const ATTR_MAGIC = 2634;
const MAGIC = 'MATR';
const VERSION = 1;

/**
 * The client's attribute bytes carry editor-side bits beyond the three flags
 * the game itself tests (its isAttrOn only ever checks BLOCK/WATER/BANPK), and
 * which bits are set varies per map. Keep only those three: everything else
 * would collide with the server's own flags - most importantly OBJECT (128),
 * which is set at runtime for buildings.
 */
const CLIENT_FLAG_MASK = 0b0000_0111;

function parseArgs() {
    const args = process.argv.slice(2);
    const result = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--maps') result.maps = args[++i];
        else if (args[i] === '--packs') result.packs = args[++i];
        else if (args[i] === '--out') result.out = args[++i];
    }
    if (!result.maps && !result.packs) {
        console.error(
            'Usage: node tools/attrConverter.js (--packs <client pack dir> | --maps <unpacked maps root>) [--out <dir>]',
        );
        process.exit(1);
    }
    result.out ??= path.join('src', 'core', 'infra', 'config', 'data', 'attr');
    return result;
}

function parseSection(buffer, label) {
    const expected = 6 + SECTION_CELLS * SECTION_CELLS;

    if (buffer.length !== expected) {
        throw new Error(`${label}: expected ${expected} bytes, got ${buffer.length}`);
    }

    const magic = buffer.readUInt16LE(0);
    const width = buffer.readUInt16LE(2);
    const height = buffer.readUInt16LE(4);

    if (magic !== ATTR_MAGIC || width !== SECTION_CELLS || height !== SECTION_CELLS) {
        throw new Error(`${label}: bad header (magic ${magic}, ${width}x${height})`);
    }

    return buffer.subarray(6);
}

/**
 * Builds a case-insensitive lookup of every attr.atr inside the client packs:
 * mapName -> sectionId -> () => Buffer.
 */
function buildPackProvider(packDir) {
    const maps = new Map();

    for (const file of fs.readdirSync(packDir)) {
        if (!file.toLowerCase().endsWith('.eix')) continue;

        const eixPath = path.join(packDir, file);
        const epkPath = path.join(packDir, file.slice(0, -4) + '.epk');
        if (!fs.existsSync(epkPath)) continue;

        let entries;
        try {
            entries = readPackIndex(eixPath);
        } catch (err) {
            console.warn(`  skipping ${file}: ${err.message}`);
            continue;
        }

        for (const entry of entries) {
            const parts = entry.filename.toLowerCase().split('/');
            if (parts.length !== 3 || parts[2] !== 'attr.atr') continue;

            const [mapName, sectionId] = parts;
            let sections = maps.get(mapName);
            if (!sections) {
                sections = new Map();
                maps.set(mapName, sections);
            }
            sections.set(sectionId, () => {
                const fd = fs.openSync(epkPath, 'r');
                try {
                    return readPackEntry(fd, entry);
                } finally {
                    fs.closeSync(fd);
                }
            });
        }
    }

    return maps;
}

/** mapName -> sectionId -> () => Buffer for an already-extracted maps folder. */
function buildDirProvider(mapsDir, mapName) {
    const mapDir = path.join(mapsDir, mapName);
    if (!fs.existsSync(mapDir)) return undefined;

    const sections = new Map();
    for (const sub of fs.readdirSync(mapDir)) {
        const attrPath = path.join(mapDir, sub, 'attr.atr');
        if (fs.existsSync(attrPath)) {
            sections.set(sub.toLowerCase(), () => fs.readFileSync(attrPath));
        }
    }
    return sections.size > 0 ? sections : undefined;
}

function convertMap(sections, mapName, width, height, outDir) {
    const widthCells = width * SECTION_CELLS;
    const heightCells = height * SECTION_CELLS;
    const grid = Buffer.alloc(widthCells * heightCells);

    let stitched = 0;
    let missing = 0;

    for (let sectionY = 0; sectionY < height; sectionY++) {
        for (let sectionX = 0; sectionX < width; sectionX++) {
            const id = String(sectionX * 1000 + sectionY).padStart(6, '0');
            const read = sections.get(id);

            if (!read) {
                missing++;
                continue;
            }

            const section = parseSection(read(), `${mapName}/${id}`);

            for (let row = 0; row < SECTION_CELLS; row++) {
                const src = row * SECTION_CELLS;
                const dst = (sectionY * SECTION_CELLS + row) * widthCells + sectionX * SECTION_CELLS;
                for (let col = 0; col < SECTION_CELLS; col++) {
                    grid[dst + col] = section[src + col] & CLIENT_FLAG_MASK;
                }
            }

            stitched++;
        }
    }

    if (stitched === 0) return false;

    if (missing > 0) {
        console.warn(`  ${mapName}: ${missing} of ${width * height} sections missing (left empty)`);
    }

    const header = Buffer.alloc(MAGIC.length + 1 + 12);
    header.write(MAGIC, 0, 'latin1');
    header.writeUInt8(VERSION, MAGIC.length);
    header.writeUInt32LE(100, MAGIC.length + 1); // cell size in world units
    header.writeUInt32LE(widthCells, MAGIC.length + 5);
    header.writeUInt32LE(heightCells, MAGIC.length + 9);

    const packed = zlib.gzipSync(Buffer.concat([header, grid]), { level: 9 });
    const outPath = path.join(outDir, `${mapName}.attr.gz`);
    fs.writeFileSync(outPath, packed);

    console.log(`  ${mapName}: ${stitched} sections -> ${outPath} (${(packed.length / 1024).toFixed(1)} KB)`);
    return true;
}

function main() {
    const { maps, packs, out } = parseArgs();
    const atlas = JSON.parse(
        fs.readFileSync(path.join('src', 'core', 'infra', 'config', 'data', 'atlasinfo.json'), 'utf8'),
    );

    fs.mkdirSync(out, { recursive: true });

    const packProvider = packs ? buildPackProvider(packs) : undefined;

    const seen = new Set();
    let converted = 0;
    const skipped = [];

    for (const { mapName, width, height } of atlas) {
        const baseName = path.basename(mapName); // season1/foo -> foo
        if (seen.has(baseName)) continue;
        seen.add(baseName);

        const sections = packProvider ? packProvider.get(baseName.toLowerCase()) : buildDirProvider(maps, baseName);

        if (!sections || !convertMap(sections, baseName, width, height, out)) {
            skipped.push(baseName);
        } else {
            converted++;
        }
    }

    console.log(`Converted ${converted} maps.`);
    if (skipped.length > 0) {
        console.log(`No client data for ${skipped.length} maps: ${skipped.join(', ')}`);
    }
}

main();
