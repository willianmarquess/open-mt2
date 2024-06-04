import fs from 'fs';
import path from 'path';
import readline from 'readline';

function clear(obj) {
    if (Array.isArray(obj)) {
        if(Array.isArray(obj[0])) {
            return obj
            .filter(item => item !== null && item !== undefined && Array.isArray(item) && !isNaN(item[0]))
        }
        return obj
            .filter(item => item !== null && item !== undefined)
    } else if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
            if (obj[key] === null || obj[key] === undefined || key === '' || key === '{') {
                delete obj[key];
            } else {
                obj[key] = clear(obj[key]);
            }
        }
    }
    return obj;
}

function parseLine(line) {
    const [key, ...valueParts] = line.trim().split(/\s+/);
    const value = valueParts.join(' ');

    switch (key) {
        case 'Accumulation':
            return { key, value: valueParts.map(parseFloat) };
        case 'MotionDuration':
            return { key, value: parseFloat(value) };
        case 'ScriptType':
        case 'MotionFileName':
            return { key, value: value.replace(/"/g, '') };
        default:
            return { key, value };
    }
}

async function processFile(inputFilePath, outputFilePath) {
    const fileStream = fs.createReadStream(inputFilePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const msaData = {};
    let currentGroup = null;
    let currentList = null;

    for await (const line of rl) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('Group')) {
            const groupName = trimmedLine.split(' ')[1];
            currentGroup = { name: groupName, data: {} };
            msaData[groupName] = currentGroup.data;
        } else if (trimmedLine === '}') {
            currentGroup = null;
            currentList = null;
        } else if (currentGroup) {
            if (trimmedLine.startsWith('List')) {
                const listName = trimmedLine.split(' ')[1];
                currentGroup.data[listName] = [];
                currentList = listName;
            } else if (currentList) {
                const values = trimmedLine.split(/\s+/).map(parseFloat);
                currentGroup.data[currentList].push(values);
            } else {
                const parsed = parseLine(trimmedLine);
                if (parsed) {
                    currentGroup.data[parsed.key] = isNaN(parsed.value) ? parsed.value.replace(/"/g, '') : parseFloat(parsed.value);
                }
            }
        } else {
            const parsed = parseLine(trimmedLine);
            if (parsed) {
                msaData[parsed.key] = isNaN(parsed.value) ? parsed.value : parseFloat(parsed.value);
            }
        }
    }
    clear(msaData);
    for (const group in msaData) {
        if (typeof msaData[group] === 'object') {
            for (const key in msaData[group]) {
                if (msaData[group][key] === null || msaData[group][key] === undefined || key === '') {
                    delete msaData[group][key];
                }
            }
        }
    }

    const jsonOutput = JSON.stringify(msaData, null, 2);
    fs.writeFileSync(outputFilePath, jsonOutput, 'utf8');
    console.log(`JSON saved to ${outputFilePath}`);
}

async function processAllFiles(inputDir, outputDir) {
    const files = fs.readdirSync(inputDir);

    for (const file of files) {
        if (path.extname(file) === '.msa') {
            const inputFilePath = path.join(inputDir, file);
            const outputFilePath = path.join(outputDir, path.basename(file, '.msa') + '.json');
            await processFile(inputFilePath, outputFilePath);
        }
    }
}

async function processDirectory(inputDirPath, outputDirPath) {
    const dirEntries = await fs.promises.readdir(inputDirPath, { withFileTypes: true });

    for (const entry of dirEntries) {
        const fullPath = path.join(inputDirPath, entry.name);
        if (entry.isDirectory()) {
            // Create corresponding directory in the output
            const outputSubDir = path.join(outputDirPath, entry.name);
            await fs.promises.mkdir(outputSubDir, { recursive: true });
            await processDirectory(fullPath, outputSubDir); // Recursively process subdirectories
        } else if (entry.isFile() && path.extname(entry.name) === '.msa') {
            const outputFilePath = path.join(outputDirPath, path.basename(entry.name, '.msa') + '.json');
            await processFile(fullPath, outputFilePath);
        }
    }
}

const inputDir = '../motionData';
const outputDir = '../src/core/infra/config/data/animation';

(async () => {
    // Create the output directory if it doesn't exist
    await fs.promises.mkdir(outputDir, { recursive: true });
    await processDirectory(inputDir, outputDir);
    console.log('MSA files converted to JSON and saved to the output directory.');
})();

processAllFiles(inputDir, outputDir);