import { join } from 'path';
import fs, { writeFile } from 'fs/promises';

const RANKS = ["PAWN", "S_PAWN", "KNIGHT", "S_KNIGHT", "BOSS", "KING"];
const DROP_FILE_PATH = join(process.cwd(), '/tools/drop/common_drop_item.txt');

async function parseDropFile(filePath) {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const lines = fileContent.split('\n').map(line => line.trim());
    const groupedDrops = {};
    RANKS.forEach(rank => {
        groupedDrops[rank] = [];
    });
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;

        const parts = line.split('\t');
        for (let rankIndex = 0; rankIndex < RANKS.length; rankIndex++) {
            const rankName = RANKS[rankIndex];
            const baseIndex = rankIndex * 6;

            if (parts.length < baseIndex + 6) continue;

            const [
                minLevel, maxLevel, percentage, vnum, count
            ] = parts.slice(baseIndex + 1, baseIndex + 6);


            if (!minLevel || !maxLevel || !percentage || !vnum || !count) continue;

            const dropItem = {
                minLevel: parseInt(minLevel, 10),
                maxLevel: parseInt(maxLevel, 10),
                percentage: Math.floor(parseFloat(percentage) * 10_000),
                vnum: parseInt(vnum, 10)
            };

            groupedDrops[rankName].push(dropItem);
        }
    }

    return groupedDrops;
}

async function main() {
    try {
        const groupedDrops = await parseDropFile(DROP_FILE_PATH);
        console.log(JSON.stringify(groupedDrops, null, 2));
        const outputFilePath = join(process.cwd(), 'common_drops.json');
        await writeFile(outputFilePath, JSON.stringify(groupedDrops, null, 4), 'utf8');
    } catch (error) {
        console.error('Error parsing drop file:', error.message);
    }
}

main();
