import { GameConfig } from '@/game/infra/config/GameConfig';
import exp from '@/core/infra/config/data/exp';

export default class ExperienceManager {
    private expTable: Array<number> = exp;
    private config: GameConfig;

    constructor({ config }) {
        this.config = config;
    }

    getNeededExperience(level: number) {
        if (level < 1 || level > this.config.MAX_LEVEL) return 0;
        return this.expTable[level - 1];
    }
}
