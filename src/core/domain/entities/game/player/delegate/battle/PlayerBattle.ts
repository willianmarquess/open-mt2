import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import Player from '../../Player';
import PlayerBattleAgainstMobStrategy from './PlayerBattleAgainstMobStrategy';
import Monster from '../../../mob/Monster';
import Logger from '@/core/infra/logger/Logger';

//TODO: add pretty singleton, instead of this;

export class PlayerBattle {
    private readonly player: Player;
    private readonly playerBattleAgainstMob: PlayerBattleAgainstMobStrategy;

    private readonly logger: Logger;

    constructor(player: Player, logger: Logger) {
        this.player = player;
        this.logger = logger;
        this.playerBattleAgainstMob = new PlayerBattleAgainstMobStrategy(player, logger);
    }

    attack(attackType: AttackTypeEnum, victim: Monster | Player) {
        if (victim instanceof Monster) {
            return this.playerBattleAgainstMob.execute(attackType, victim);
        }

        if (victim instanceof Player) {
            //TODO: pvp
            this.logger.info(`[PlayerBattle] Player against Player not exist yet`);
        }
    }
}
