import GameApplication from './app/GameApplication';
import { container } from './Container';

const app = new GameApplication(container.cradle as any);

app.start().catch((error) => {
    console.error('error when start application', error);
    process.exit(1);
});

const SIGNALS = ['SIGINT', 'SIGTERM'];
const ERRORS = ['unhandledRejection', 'uncaughtException'];

SIGNALS.forEach((signal) => {
    process.on(signal, () => {
        void app
            .close()
            .then(() => process.exit(0))
            .catch((error) => {
                console.error('error when closing application', error);
                process.exit(1);
            });
    });
});

ERRORS.forEach((signal) => {
    process.on(signal, (error) => {
        console.error(`Error event: ${signal}`, error);
        void app
            .close()
            .catch((closeError) => console.error('error when closing application', closeError))
            .finally(() => process.exit(1));
    });
});
