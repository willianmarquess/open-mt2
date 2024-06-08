import exp from '../../infra/config/data/exp.js';

export default class ExperienceManager {
    #expTable = exp;
    #config;

    constructor({ config }) {
        this.#config = config;
    }

    getNeededExperience(level) {
        if (level < 1 || level > this.#config.MAX_LEVEL) return 0;
        return this.#expTable[level - 1];
    }
}
