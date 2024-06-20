import { container } from './Container.js';
import AuthApplication from './app/AuthApplication.js';

const app = new AuthApplication(container.cradle);

app.start().catch((error) => {
    console.error('error when start application', error);
    process.exit(1);
});

const SIGNALS = ['SIGINT', 'SIGTERM'];
const ERRORS = ['unhandledRejection', 'uncaughtException'];

SIGNALS.forEach((signal) => {
    process.on(signal, async () => {
        await app.close();
        process.exit(0);
    });
});

ERRORS.forEach((signal) => {
    process.on(signal, async (error) => {
        console.error(`Error event: ${signal}`, error);
        await app.close();
        process.exit(1);
    });
});