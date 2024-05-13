import { container } from './Container.js';
import GameApplication from './app/GameApplication.js';

const app = new GameApplication(container.cradle);

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
