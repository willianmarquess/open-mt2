import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inputFilePath = path.join(__dirname, '..', '..', 'src', 'core', 'interface', 'networking', 'packets', 'packet', 'out'); 

function findPacketFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(findPacketFiles(filePath));
        } else if (file.includes('Packet') && file.endsWith('.js')) {
            results.push(filePath);
        }
    });

    return results;
}

function processFile(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    console.log(`\nProcessing file: ${filePath}`);

    const packetInfo = fileContent.match(/\/\*\*([\s\S]*?)\*\//g)?.find(block => block.includes('@packet'));
    if (!packetInfo) {
        return null;
    }

    const name = packetInfo.match(/@name\s+(.+)/)?.[1].trim();
    const header = packetInfo.match(/@header\s+(.+)/)?.[1].trim();
    const size = packetInfo.match(/@size\s+(.+)/)?.[1].trim();
    const description = packetInfo.match(/@description\s+(.+)/)?.[1].trim();
    const type = packetInfo.match(/@type\s+(.+)/)?.[1].trim();

    const fields = Array.from(packetInfo.matchAll(/- \{(\w+)(?:\[(\d+)\])?\} (\w+) (\d+) (.+)/g)).map(match => {
        return {
            type: match[1],
            arraySize: match[2] ? parseInt(match[2], 10) : null,
            name: match[3],
            size: parseInt(match[4], 10),
            description: match[5]
        };
    });

    console.log(`Packet: ${name}`);
    console.log(`Fields found:`, fields);

    let md = `### ${name}\n\n`;
    md += `**Type:** ${type}\n\n`;
    md += `**Header:** ${header}\n\n`;
    md += `**Size:** ${size} bytes\n\n`;
    md += `**Description:** ${description}\n\n`;
    md += `**Fields:**\n\n`;
    md += `| Name        | Type       | Size (bytes)   | Description               |\n`;
    md += `|-------------|------------|----------------|---------------------------|\n`;

    fields.forEach(field => {
        const typeDisplay = field.arraySize ? `${field.type}[${field.arraySize}]` : field.type;
        md += `| ${field.name} | \`${typeDisplay}\` | ${field.size} | ${field.description} |\n`;
    });

    md += `\n---\n\n`;
    return md;
}

function generateDocumentation(dir) {
    const packetFiles = findPacketFiles(dir);
    let documentationContent = `# Packet Documentation\n\n`;

    packetFiles.forEach(filePath => {
        const packetDoc = processFile(filePath);
        if (packetDoc) {
            documentationContent += packetDoc;
        }
    });

    const outputPath = path.join(__dirname, '..', '..', 'docs', 'packets.md');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, documentationContent);
    console.log(`\nComplete documentation generated at ${outputPath}`);
}

const packetDir = path.join('src');
generateDocumentation(inputFilePath);