import fs from 'fs';
import path from 'path';
import readline from 'readline';

async function parseFileToJson(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let result = [];
    let currentObject = null;

    for await (const line of rl) {
        const trimmedLine = line.trim();

        if (trimmedLine === '') continue;

        if (trimmedLine.startsWith('Group')) {
            currentObject = { mobs: [] };
            result.push(currentObject);
        }

        if (trimmedLine.startsWith('Leader')) {
            const parts = trimmedLine.split('\t');
            currentObject.leaderVnum = parts[2];
        }

        if (trimmedLine.startsWith('Vnum')) {
            const parts = trimmedLine.split('\t');
            currentObject.vnum = parts[1];
        }

        const mobMatch = trimmedLine.match(/^\d+/);
        if (mobMatch) {
            const parts = trimmedLine.split('\t');
            currentObject.mobs.push({ vnum: parts[2] });
        }
    }

    return result;
}

async function main(inputDirectory, outputDirectory) {
    const files = findFiles(inputDirectory, '.txt');

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

function findFiles(dir, extension) {
    let results = [];
    fs.readdirSync(dir).forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(findFiles(file, extension));
        } else if (path.extname(file) === extension) {
            results.push(file);
        }
    });
    return results;
}

const inputDir = './';  
const outputDir = '../';  

main(inputDir, outputDir);
