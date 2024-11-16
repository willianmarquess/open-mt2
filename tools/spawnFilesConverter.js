import fs from 'fs';
import path from 'path';
import readline from 'readline';

const headers = ['type', 'x', 'y', 'rangeX', 'rangeY', 'z', 'direction', 'spawnTime', 'percent', 'count', 'vnum'];


function findFiles(dir, filename) {
    let results = [];
    fs.readdirSync(dir).forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(findFiles(file, filename));
        } else if (path.basename(file) === filename) {
            results.push(file);
        }
    });
    return results;
}

function parseFileToJson(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const result = [];

    rl.on('line', (line) => {
        if (line.startsWith('//') || line.trim() === '') {
            return;
        }

        const values = line.split('\t');
        const obj = {};

        headers.forEach((header, index) => {
            obj[header] = values[index];
        });

        result.push(obj);
    });

    return new Promise((resolve) => {
        rl.on('close', () => {
            resolve(result);
        });
    });
}

async function main(inputDirectory, outputDirectory) {
    const files = findFiles(inputDirectory, 'boss.txt');

    for (const file of files) {
        const jsonData = await parseFileToJson(file);
        const relativePath = path.relative(inputDirectory, file);
        const jsonFilePath = path.join(outputDirectory, relativePath);
        const jsonDir = path.dirname(jsonFilePath);

        fs.mkdirSync(jsonDir, { recursive: true });

        const jsonFileName = jsonFilePath.replace('.txt', '.json');
        fs.writeFileSync(jsonFileName, JSON.stringify(jsonData, null, 2), 'utf8');
        console.log(`File ${jsonFileName} has been created.`);
    }
}

const inputDir = './map';
const outputDir = '../map';

main(inputDir, outputDir);
