import { container } from '../src/auth/Container';
import AuthApplication from '../src/auth/app/AuthApplication';
const app = new AuthApplication(container.cradle);

before(async () => {
    await app.start();
});

after(async () => {
    await app.close();
});
