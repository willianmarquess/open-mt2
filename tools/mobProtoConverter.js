import fs from 'fs';
import path from 'path';

function txtToJson(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');

    const lines = data.trim().split('\n');

    const headers = lines[0].split('\t').map(header => header.toLowerCase());
    
    const jsonArray = lines.slice(1).map(line => {
        const values = line.split('\t');
        let jsonObject = {};
        headers.forEach((header, index) => {
            jsonObject[header] = values[index] || null; 
        });
        return jsonObject;
    });

    const jsonString = JSON.stringify(jsonArray, null, 2);
    return jsonString;
}

const filePath = path.join(import.meta.dirname, 'mob_proto.txt'); 

const jsonResult = txtToJson(filePath);
console.log(jsonResult);

const outputFilePath = path.join(import.meta.dirname, 'teste.json');
fs.writeFileSync(outputFilePath, jsonResult, 'utf8');