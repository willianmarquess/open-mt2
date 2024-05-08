import { container } from './Container.js';

function main() {
    try {
        const { server } = container.cradle;
        server.setup().start();
    } catch (error) {
        console.error('error when init auth server', error);
        process.exit(1);
    }
}

main();
