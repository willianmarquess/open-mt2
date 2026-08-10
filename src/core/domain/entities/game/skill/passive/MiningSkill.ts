import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import GameEntity from '../../GameEntity';
import { PassiveSkill, SkillApplies } from '../Skill';
import { SkillEnum } from '@/core/enum/SkillEnum';

export class MiningSkill extends PassiveSkill {
    public id: SkillEnum = SkillEnum.MINING;
    public maxLevel: number = 40;
    public levelStep: number = 1;
    public levelLimit: number = 0;
    public range: number = 0;
    public flags: Set<SkillFlagsEnum> = new Set([SkillFlagsEnum.DISABLE_BY_POINT_UP]);
    public applies: Set<SkillApplies> = new Set();
    public affects: Set<SkillAffectEnum> = new Set();

    public canBeUsedBy(entity: GameEntity): boolean {
        return entity.isPlayer();
    }
}
