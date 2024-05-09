import { container } from './Container.js';
import Application from './app/Application.js';

function main() {
    try {
        new Application(container).start();
    } catch (error) {
        console.error('error when init auth server', error);
        process.exit(1);
    }
}

main();
