import fs from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';

const SEED_ADMIN_HASH_PLACEHOLDER = '{{SEED_ADMIN_PASSWORD_HASH}}';
const SAULT_ROUNDS = 5;

async function loadScript() {
    const bruteScript = (await fs.readFile(path.resolve(__dirname, '../scripts/script.sql'))).toString();
    const seedAdminHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'admin', SAULT_ROUNDS);
    const scriptWithSeedValues = bruteScript.replaceAll(SEED_ADMIN_HASH_PLACEHOLDER, seedAdminHash);
    const cleanedScript = scriptWithSeedValues.replace(/(\r\n|\n|\r)/gm, '');
    const scriptSplittedByCommand = cleanedScript.split(';');
    const validCommandScriptArray = scriptSplittedByCommand.filter(Boolean);
    return validCommandScriptArray;
}

export default loadScript;
