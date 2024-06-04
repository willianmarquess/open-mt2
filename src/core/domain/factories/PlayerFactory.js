import Player from '../entities/player/Player.js';
import EmpireUtil from '../util/EmpireUtil.js';
import JobUtil from '../util/JobUtil.js';

export default class PlayerFactory {
    #config;
    #animationManager;

    constructor({ config, animationManager }) {
        this.#config = config;
        this.#animationManager = animationManager;
    }

    create({
        playerClass,
        accountId,
        appearance,
        slot,
        virtualId,
        id,
        updatedAt,
        createdAt,
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
    }) {
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
                positionX: positionX || Number(this.#config.empire[empireName].startPosX),
                positionY: positionY || Number(this.#config.empire[empireName].startPosY),
                st: st || this.#config.jobs[className].common.st,
                ht: ht || this.#config.jobs[className].common.ht,
                dx: dx || this.#config.jobs[className].common.dx,
                iq: iq || this.#config.jobs[className].common.iq,
                health: health || this.#config.jobs[className].common.initialHp,
                mana: mana || this.#config.jobs[className].common.initialMp,
                stamina: stamina || this.#config.jobs[className].common.initialStamina,
                hpPerLvl: this.#config.jobs[className].common.hpPerLvl,
                hpPerHtPoint: this.#config.jobs[className].common.hpPerHtPoint,
                mpPerLvl: this.#config.jobs[className].common.mpPerLvl,
                mpPerIqPoint: this.#config.jobs[className].common.mpPerIqPoint,
                baseAttackSpeed: this.#config.jobs[className].common.initialAttackSpeed,
                baseMovementSpeed: this.#config.jobs[className].common.initialMovementSpeed,
                baseHealth: this.#config.jobs[className].common.initialHp,
                baseMana: this.#config.jobs[className].common.initialMp,
                virtualId,
                bodyPart,
                hairPart,
                givenStatusPoints,
                availableStatusPoints,
                id,
                updatedAt,
                createdAt,
                skillGroup,
                playTime,
                level,
                experience,
                gold,
            },
            {
                animationManager: this.#animationManager,
            },
        );
    }
}
