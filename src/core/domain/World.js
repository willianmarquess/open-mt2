const TICKS_PER_SECONDS = 10;

function calculateTickDelay(delta = 0) {
    const delay = 1000 / TICKS_PER_SECONDS - delta;
    return delay > 0 ? delay : 0;
}

export default class World {
    #players = new Set();
    #server;
    #logger;

    #virtualId = 0;

    #deltas = new Array();

    constructor({ server, logger }) {
        this.#server = server;
        this.#logger = logger;
    }

    generateVirtualId() {
        return ++this.#virtualId;
    }

    get players() {
        return this.#players;
    }

    init() {
        this.#tick();
    }

    async #tick() {
        const startTickTime = performance.now();
        //do some stuff like update maps -> update players/npcs/monsters
        this.#server.processMessages();
        this.#server.sendPendingMessages();

        const delta = performance.now() - startTickTime;
        this.#deltas.push(delta);

        if (this.#deltas.length === 100) {
            const averageTick = this.#deltas.reduce((acc, curr) => acc + curr, 0);
            this.#logger.info(`average tick time is: ~${(averageTick / 100).toFixed(2)}ms`);
            this.#deltas = [];
        }

        setTimeout(this.#tick.bind(this), calculateTickDelay(delta));
        return Promise.resolve();
    }
}
