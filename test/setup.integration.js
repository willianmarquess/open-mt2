import { container } from '../src/auth/Container.js';
import AuthApplication from '../src/auth/app/AuthApplication.js';
const app = new AuthApplication(container.cradle);

before(async () => {
    await app.start();
});

after(async () => {
    await app.close();
});
