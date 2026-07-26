import { expect } from 'chai';
import bcrypt from 'bcryptjs';
import loadScript from '@/core/infra/database/scripts/loadScript';

describe('loadScript', () => {
    it('should return non-empty sql commands', async () => {
        const commands = await loadScript();

        expect(commands.length).to.be.greaterThan(0);
        commands.forEach((command) => expect(command).to.be.a('string').and.not.empty);
    });

    it('should replace the seed admin password placeholder with a bcrypt hash', async () => {
        const commands = await loadScript();

        const joined = commands.join(';');
        expect(joined).to.not.include('{{SEED_ADMIN_PASSWORD_HASH}}');

        const accountInserts = commands.filter((command) => command.includes('INSERT INTO auth.account ('));
        expect(accountInserts.length).to.be.greaterThan(0);

        const hashMatch = accountInserts[0].match(/\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}/);
        expect(hashMatch).to.not.be.null;

        const isDefaultPassword = await bcrypt.compare(process.env.SEED_ADMIN_PASSWORD || 'admin', hashMatch![0]);
        expect(isDefaultPassword).to.be.equal(true);
    });
});
