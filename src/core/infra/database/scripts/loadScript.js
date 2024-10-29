import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

async function loadScript() {
    const bruteScript = (
        await fs.readFile(path.resolve(url.fileURLToPath(import.meta.url), '../script.sql'))
    ).toString();
    const cleanedScript = bruteScript.replace(/(\r\n|\n|\r)/gm, '');
    const scriptSplittedByCommand = cleanedScript.split(';');
    const validCommandScriptArray = scriptSplittedByCommand.filter((s) => s);
    return validCommandScriptArray;
}

export default loadScript;
