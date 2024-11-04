import { container } from '../src/auth/Container.js';
import AuthApplication from '../src/auth/app/AuthApplication.js';

before(async () => {
    const app = new AuthApplication(container.cradle);

    await app.start();
});
