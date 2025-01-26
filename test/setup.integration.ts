import AuthApplication from '@/auth/app/AuthApplication';
import { container } from '@/auth/Container';
const app = new AuthApplication(container.cradle);

before(async () => {
    await app.start();
});

after(async () => {
    await app.close();
});
