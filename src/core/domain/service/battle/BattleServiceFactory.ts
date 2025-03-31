import Character from '../../entities/game/Character';
import Logger from '@/core/infra/logger/Logger';
import Player from '../../entities/game/player/Player';
import Monster from '../../entities/game/mob/Monster';
import BattleService from './BattleService';
import BattlePlayerAgainstMobService from './BattlePlayerAgainstMobService';
import BattleMobAgainstPlayerService from './BattleMobAgainstPlayerService';

export default class BattleServiceFactory {
    private readonly logger: Logger;

    constructor({ logger }) {
        this.logger = logger;
    }

    createBattleService(attacker: Character, victim: Character): BattleService {
        if (attacker instanceof Player && victim instanceof Monster) {
            return new BattlePlayerAgainstMobService(this.logger, attacker, victim);
        }

        if (attacker instanceof Player && victim instanceof Player) {
            //TODO: pvp
        }

        if (attacker instanceof Monster && victim instanceof Player) {
            return new BattleMobAgainstPlayerService(this.logger, attacker, victim);
        }

        throw new Error('Unsupported battle configuration');
    }
}
