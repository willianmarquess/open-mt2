import { container } from './Container.js';
import Application from './app/Application.js';

new Application(container)
    .start()
    .catch(error => {
        console.error('error when start application', error);
        process.exit(1);
    });