import fs from 'fs';
import readline from 'readline';

function parseLine(line) {
    const [mapName, posX, posY, width, height] = line.split(/\s+/);
    return {
        mapName,
        posX: parseInt(posX, 10) || 0,
        posY: parseInt(posY, 10) || 0,
        width: parseInt(width, 10) || 0,
        height: parseInt(height, 10) || 0
    };
}

async function processFile(inputFilePath, outputFilePath) {
    const fileStream = fs.createReadStream(inputFilePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const maps = [];

    for await (const line of rl) {
        const map = parseLine(line);
        maps.push(map);
    }

    const jsonOutput = JSON.stringify(maps, null, 2);
    fs.writeFileSync(outputFilePath, jsonOutput, 'utf8');
    console.log(`JSON saved to ${outputFilePath}`);
}

const inputFilePath = '../atlasinfo.txt';
const outputFilePath = '../src/core/infra/config/data/atlasinfo.json';

processFile(inputFilePath, outputFilePath);