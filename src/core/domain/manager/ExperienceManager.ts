import { GameConfig } from '@/game/infra/config/GameConfig';
import exp from '@/core/infra/config/data/exp/exp';
import Player from '../entities/game/player/Player';
import Monster from '../entities/game/mob/Monster';
import Stone from '../entities/game/mob/Stone';
import MathUtil from '../util/MathUtil';
import { PrivilegeManager, PrivilegeTypeEnum } from './PrivilegeManager';
import { SpecialItemEnum } from '@/core/enum/SpecialItemEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';

export default class ExperienceManager {
    private readonly expTable: Array<number> = exp;
    private readonly config: GameConfig;
    private readonly privilegeManager: PrivilegeManager;

    constructor({ config, privilegeManager }) {
        this.config = config;
        this.privilegeManager = privilegeManager;
    }

    getNeededExperience(level: number) {
        if (level < 1 || level > this.config.MAX_LEVEL) return 0;
        return this.expTable[level - 1];
    }

    calculateExpToGive(player: Player, monster: Monster | Stone, exp: number) {
        const levelDelta = monster.getLevel() + 15 - player.getLevel();
        const delta = this.config.expDeltaLevel[MathUtil.minMax(0, levelDelta, this.config.expDeltaLevel.length)];
        exp = (exp * delta) / 100;

        exp = (exp * (100 + this.privilegeManager.getPlayerPrivilege(player, PrivilegeTypeEnum.EXP))) / 100;
        exp = (exp * (100 + this.privilegeManager.getEmpirePrivilege(player.getEmpire(), PrivilegeTypeEnum.EXP))) / 100;

        if (player.isEquippedWithUniqueItem(SpecialItemEnum.UNIQUE_ITEM_LARBOR_MEDAL)) {
            exp += exp * 0.2;
        }

        const expDoubleBonus = player.getPoint(PointsEnum.EXP_DOUBLE_BONUS);

        if (expDoubleBonus > 0) {
            if (MathUtil.getRandomInt(0, 100) <= expDoubleBonus) {
                exp = exp * 1.3; //TODO: validate double xp multiply
            }
        }

        if (player.isEquippedWithUniqueItem(SpecialItemEnum.UNIQUE_ITEM_DOUBLE_EXP)) {
            exp = exp * 1.5;
        }

        if (player.isEquippedWithUniqueItem(SpecialItemEnum.UNIQUE_GROUP_RING_OF_EXP)) {
            exp = exp * 2;
        }

        //TODO: add mount exp bonus
        //TODO: add party exp bonus
        //TODO: add guild exp bonus
        //TODO: add marriage exp bonus

        return Math.floor(exp);
    }
}
