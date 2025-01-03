import fs from 'node:fs/promises';
import path from 'node:path';

async function loadScript() {
    const bruteScript = (await fs.readFile(path.resolve(__dirname, '../scripts/script.sql'))).toString();
    const cleanedScript = bruteScript.replace(/(\r\n|\n|\r)/gm, '');
    const scriptSplittedByCommand = cleanedScript.split(';');
    const validCommandScriptArray = scriptSplittedByCommand.filter((s) => s);
    return validCommandScriptArray;
}

export default loadScript;
