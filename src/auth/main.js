import { container } from './Container.js';
import Application from './app/Application.js';

const app = new Application(container.cradle);

app.start().catch((error) => {
    console.error('error when start application', error);
    process.exit(1);
});

const SIGNALS = ['SIGINT', 'SIGTERM'];

SIGNALS.forEach((signal) => {
    process.on(signal, async () => {
        await app.close();
        process.exit(0);
    });
});
