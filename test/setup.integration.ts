import { container } from './auth/Container';
import AuthApplication from './auth/app/AuthApplication';
const app = new AuthApplication(container.cradle);

before(async () => {
    await app.start();
});

after(async () => {
    await app.close();
});
