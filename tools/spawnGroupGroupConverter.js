import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Função para converter o conteúdo de um arquivo para JSON
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

        // Ignorar linhas vazias
        if (trimmedLine === '') continue;

        // Início de um novo grupo
        if (trimmedLine.startsWith('Group')) {
            currentObject = { mobs: [] };
            result.push(currentObject);
        }

        // Processar linha com Vnum
        if (trimmedLine.startsWith('Vnum')) {
            const parts = trimmedLine.split('\t');
            currentObject.vnum = parts[1];
        }

        // Processar linha com mobs
        const mobMatch = trimmedLine.match(/^\d+/);
        if (mobMatch) {
            const parts = trimmedLine.split('\t');
            currentObject.mobs.push({ vnum: parts[1], count: parts[2] });
        }
    }

    return result;
}

// Função principal para encontrar arquivos, ler e converter para JSON
async function main(inputDirectory, outputDirectory) {
    const files = findFiles(inputDirectory, '.txt');

    for (const file of files) {
        const jsonData = await parseFileToJson(file);
        const relativePath = path.relative(inputDirectory, file);
        const jsonFilePath = path.join(outputDirectory, relativePath);
        const jsonDir = path.dirname(jsonFilePath);

        // Criar o diretório de saída se não existir
        fs.mkdirSync(jsonDir, { recursive: true });

        // Salvar o arquivo JSON na pasta de saída com o mesmo nome de arquivo .txt
        const jsonFileName = jsonFilePath.replace('.txt', '.json');
        fs.writeFileSync(jsonFileName, JSON.stringify(jsonData, null, 2), 'utf8');
        console.log(`File ${jsonFileName} has been created.`);
    }
}

// Função para encontrar todos os arquivos .txt em um diretório e seus subdiretórios
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

// Executar a função principal passando o diretório de entrada e saída desejados
const inputDir = './';  // Substitua pelo caminho do diretório de entrada
const outputDir = '../';  // Substitua pelo caminho do diretório de saída

main(inputDir, outputDir);
