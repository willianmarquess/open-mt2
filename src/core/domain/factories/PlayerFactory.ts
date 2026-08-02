import { GameConfig } from '@/game/infra/config/GameConfig';
import AnimationManager from '@/core/domain/manager/AnimationManager';
import ExperienceManager from '@/core/domain/manager/ExperienceManager';
import Logger from '@/core/infra/logger/Logger';
import JobUtil from '@/core/domain/util/JobUtil';
import EmpireUtil from '@/core/domain/util/EmpireUtil';
import Player from '../entities/game/player/Player';
import SaveCharacterService from '@/game/domain/service/SaveCharacterService';
import { QuestManager } from '../quests/QuestManager';
import GlobalEventTimerManager from '../manager/GlobalEventTimeManager';
import MobManager from '../manager/MobManager';
import { SkillManager } from '../manager/SkillManager';

export type PlayerFactoryParams = {
    playerClass: number;
    accountId: number;
    appearance?: number;
    slot: number;
    virtualId?: number;
    id?: number;
    empire: number;
    skillGroup?: number;
    playTime?: number;
    level?: number;
    experience?: number;
    gold?: number;
    st?: number;
    ht?: number;
    dx?: number;
    iq?: number;
    positionX?: number;
    positionY?: number;
    health?: number;
    mana?: number;
    stamina?: number;
    bodyPart?: number;
    hairPart?: number;
    name: string;
    givenStatusPoints?: number;
    availableStatusPoints?: number;
    quickSlot?: Map<number, { type: number; position: number }>;
    horseLevel?: number;
    horseHealth?: number;
    horseStamina?: number;
    horseName?: string;
    horseRiding?: number;
};

export class PlayerFactory {
    static create(
        {
            playerClass,
            accountId,
            appearance,
            slot,
            virtualId,
            id,
            empire,
            skillGroup,
            playTime,
            level,
            experience,
            gold,
            st,
            ht,
            dx,
            iq,
            positionX,
            positionY,
            health,
            mana,
            stamina,
            bodyPart,
            hairPart,
            name,
            givenStatusPoints,
            availableStatusPoints,
            quickSlot,
            horseLevel,
            horseHealth,
            horseStamina,
            horseName,
            horseRiding,
        }: PlayerFactoryParams,
        {
            animationManager,
            config,
            experienceManager,
            logger,
            saveCharacterService,
            questManager,
            eventTimerManager,
            mobManager,
            skillManager,
        }: {
            animationManager: AnimationManager;
            experienceManager: ExperienceManager;
            config: GameConfig;
            logger: Logger;
            saveCharacterService: SaveCharacterService;
            questManager: QuestManager;
            eventTimerManager: GlobalEventTimerManager;
            mobManager: MobManager;
            skillManager: SkillManager;
        },
    ): Player {
        const className = JobUtil.getClassNameFromClassId(playerClass);
        const empireName = EmpireUtil.getEmpireName(empire);

        return Player.create(
            {
                accountId,
                name,
                empire,
                playerClass,
                appearance: appearance || 0, //verify this
                slot,
                positionX: positionX || Number(config.empire[empireName]?.startPosX),
                positionY: positionY || Number(config.empire[empireName]?.startPosY),
                st: st || config.jobs[className].common.st,
                ht: ht || config.jobs[className].common.ht,
                dx: dx || config.jobs[className].common.dx,
                iq: iq || config.jobs[className].common.iq,
                health: health || config.jobs[className].common.initialHp,
                mana: mana || config.jobs[className].common.initialMp,
                stamina: stamina || config.jobs[className].common.initialStamina,
                hpPerLvl: config.jobs[className].common.hpPerLvl,
                hpPerHtPoint: config.jobs[className].common.hpPerHtPoint,
                mpPerLvl: config.jobs[className].common.mpPerLvl,
                mpPerIqPoint: config.jobs[className].common.mpPerIqPoint,
                baseAttackSpeed: config.jobs[className].common.initialAttackSpeed,
                baseMovementSpeed: config.jobs[className].common.initialMovementSpeed,
                baseHealth: config.jobs[className].common.initialHp,
                baseMana: config.jobs[className].common.initialMp,
                defensePerHtPoint: config.jobs[className].common.defensePerHtPoint,
                attackPerDxPoint: config.jobs[className].common.attackPerDXPoint,
                attackPerIqPoint: config.jobs[className].common.attackPerIQPoint,
                attackPerStPoint: config.jobs[className].common.attackPerStPoint,
                virtualId: virtualId || 0,
                bodyPart: bodyPart || 0,
                hairPart: hairPart || 0,
                givenStatusPoints: givenStatusPoints || 0,
                availableStatusPoints: availableStatusPoints || 0,
                id: id || 0,
                skillGroup: skillGroup || 0,
                playTime: playTime || 0,
                level: level || 1,
                experience: experience || 0,
                gold: gold || 0,
                quickSlot: quickSlot || new Map<number, { type: number; position: number }>(),
                horseLevel: horseLevel || 0,
                horseHealth: horseHealth || 0,
                horseStamina: horseStamina || 0,
                horseName: horseName || '',
                horseRiding: horseRiding || 0,
            },
            {
                animationManager,
                config,
                experienceManager,
                logger,
                saveCharacterService,
                questManager,
                eventTimerManager,
                mobManager,
                skillManager,
            },
        );
    }
}
