import AuthApplication from '@/auth/app/AuthApplication';
import { container } from '@/auth/Container';
import AttackHarness from './support/AttackSession';
const app = new AuthApplication(container.cradle);

before(async () => {
    await app.start();
});

after(async function () {
    this.timeout(30000);
    await AttackHarness.shutdown();
    await app.close();
});
