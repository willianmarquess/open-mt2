import { GameConfig } from '@/game/infra/config/GameConfig';
import AnimationManager from '@/core/domain/manager/AnimationManager';
import ExperienceManager from '@/core/domain/manager/ExperienceManager';
import Logger from '@/core/infra/logger/Logger';
import JobUtil from '@/core/domain/util/JobUtil';
import EmpireUtil from '@/core/domain/util/EmpireUtil';
import Player from '../entities/game/player/Player';

type PlayerFactoryParams = {
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
};

export default class PlayerFactory {
    private config: GameConfig;
    private animationManager: AnimationManager;
    private experienceManager: ExperienceManager;
    private logger: Logger;

    constructor({ config, animationManager, experienceManager, logger }) {
        this.config = config;
        this.animationManager = animationManager;
        this.experienceManager = experienceManager;
        this.logger = logger;
    }

    create({
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
    }: PlayerFactoryParams) {
        const className = JobUtil.getClassNameFromClassId(playerClass);
        const empireName = EmpireUtil.getEmpireName(empire);

        return Player.create(
            {
                accountId,
                name,
                empire,
                playerClass,
                appearance, //verify this
                slot,
                positionX: positionX || Number(this.config.empire[empireName].startPosX),
                positionY: positionY || Number(this.config.empire[empireName].startPosY),
                st: st || this.config.jobs[className].common.st,
                ht: ht || this.config.jobs[className].common.ht,
                dx: dx || this.config.jobs[className].common.dx,
                iq: iq || this.config.jobs[className].common.iq,
                health: health || this.config.jobs[className].common.initialHp,
                mana: mana || this.config.jobs[className].common.initialMp,
                stamina: stamina || this.config.jobs[className].common.initialStamina,
                hpPerLvl: this.config.jobs[className].common.hpPerLvl,
                hpPerHtPoint: this.config.jobs[className].common.hpPerHtPoint,
                mpPerLvl: this.config.jobs[className].common.mpPerLvl,
                mpPerIqPoint: this.config.jobs[className].common.mpPerIqPoint,
                baseAttackSpeed: this.config.jobs[className].common.initialAttackSpeed,
                baseMovementSpeed: this.config.jobs[className].common.initialMovementSpeed,
                baseHealth: this.config.jobs[className].common.initialHp,
                baseMana: this.config.jobs[className].common.initialMp,
                defensePerHtPoint: this.config.jobs[className].common.defensePerHtPoint,
                attackPerDXPoint: this.config.jobs[className].common.attackPerDXPoint,
                attackPerIQPoint: this.config.jobs[className].common.attackPerIQPoint,
                attackPerStPoint: this.config.jobs[className].common.attackPerStPoint,
                virtualId,
                bodyPart,
                hairPart,
                givenStatusPoints,
                availableStatusPoints,
                id,
                skillGroup,
                playTime,
                level,
                experience,
                gold,
            },
            {
                animationManager: this.animationManager,
                config: this.config,
                experienceManager: this.experienceManager,
                logger: this.logger,
            },
        );
    }
}
