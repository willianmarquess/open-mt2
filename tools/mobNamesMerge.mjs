/*
 * Merge readable mob names into src/core/infra/config/data/mobs.json.
 *
 * Primary source: a locale `mob_names.txt` file dumped from the game client
 * (e.g. with Eternexus dump_proto over locale_xx/mob_proto). Expected format,
 * tab-separated, one entry per line:
 *
 *     VNUM	LOCALE_NAME
 *     101	Wild Dog
 *     20349	Stable Boy
 *
 * Only mobs whose current name is corrupted (contains '?', or is a placeholder
 * like '..') are touched — valid existing names are never overwritten.
 *
 * For vnums the locale file does not cover (or covers with '????'), fallbacks
 * are derived from the mob's own data, in order:
 *   1. WARP entities            -> "Warp Gate"
 *   2. client model folder      -> humanized folder name (e.g. orc_lord -> "Orc Lord")
 *   3. GOTO entities            -> "Goto Point"
 *   4. NPC without any data     -> "Unknown NPC"
 *   5. anything else            -> "Unknown Monster"
 *
 * Usage: node tools/mobNamesMerge.mjs <path-to-locale-mob_names.txt>
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const namesFile = process.argv[2];
if (!namesFile) {
    console.error('Usage: node tools/mobNamesMerge.mjs <path-to-locale-mob_names.txt>');
    console.error('       (tab-separated client dump: VNUM\tLOCALE_NAME)');
    process.exit(1);
}

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const mobsPath = path.resolve(toolDir, '../src/core/infra/config/data/mobs.json');
const mobs = JSON.parse(fs.readFileSync(mobsPath, 'utf8'));

const localeNames = new Map();
for (const line of fs.readFileSync(namesFile, 'utf8').split(/\r?\n/)) {
    const [vnum, localeName] = line.split('\t');
    if (!vnum || !localeName || vnum === 'VNUM') continue;
    localeNames.set(vnum.trim(), localeName.trim());
}

const isBroken = (name) => {
    const value = String(name || '').trim();
    return value.length < 3 || value.includes('?');
};

const humanizeFolder = (folder) =>
    String(folder)
        .split(/[_\s]+/)
        .filter(Boolean)
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(' ')
        .replace(/^Ch /, '');

const stats = { locale: 0, warp: 0, folder: 0, goto: 0, unknown: 0 };
for (const mob of mobs) {
    if (!isBroken(mob.name)) continue;

    const localeName = localeNames.get(String(mob.vnum));
    if (localeName && !isBroken(localeName)) {
        mob.name = localeName;
        stats.locale++;
    } else if (mob.type === 'WARP') {
        mob.name = 'Warp Gate';
        stats.warp++;
    } else if (mob.folder) {
        mob.name = humanizeFolder(mob.folder);
        stats.folder++;
    } else if (mob.type === 'GOTO') {
        mob.name = 'Goto Point';
        stats.goto++;
    } else {
        mob.name = mob.type === 'NPC' ? 'Unknown NPC' : 'Unknown Monster';
        stats.unknown++;
    }
}

fs.writeFileSync(mobsPath, JSON.stringify(mobs, null, 2) + '\n');

const stillBroken = mobs.filter((mob) => isBroken(mob.name)).length;
console.log('renamed from locale file:', stats.locale);
console.log('fallbacks — warp:', stats.warp, '| folder:', stats.folder, '| goto:', stats.goto, '| unknown:', stats.unknown);
console.log('still broken:', stillBroken, '| total mobs:', mobs.length);
