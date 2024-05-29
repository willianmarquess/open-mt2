import Player from '../entities/Player.js';
import EmpireUtil from '../util/EmpireUtil.js';
import JobUtil from '../util/JobUtil.js';

export default class PlayerFactory {
    #config;

    constructor({ config }) {
        this.#config = config;
    }

    create({ playerClass, empireId, playerName, accountId, appearance, slot }) {
        const className = JobUtil.getClassNameFromClassId(playerClass);
        const empireName = EmpireUtil.getEmpireName(empireId);

        return Player.create({
            accountId,
            name: playerName,
            empire: empireId,
            playerClass,
            appearance, //verify this
            slot,
            positionX: Number(this.#config.empire[empireName].startPosX),
            positionY: Number(this.#config.empire[empireName].startPosY),
            st: this.#config.jobs[className].common.st,
            ht: this.#config.jobs[className].common.ht,
            dx: this.#config.jobs[className].common.dx,
            iq: this.#config.jobs[className].common.iq,
            health: this.#config.jobs[className].common.initialHp,
            mana: this.#config.jobs[className].common.initialMp,
            stamina: this.#config.jobs[className].common.initialStamina,
            hpPerLvl: this.#config.jobs[className].common.hpPerLvl,
            hpPerHtPoint: this.#config.jobs[className].common.hpPerHtPoint,
            mpPerLvl: this.#config.jobs[className].common.mpPerLvl,
            mpPerIqPoint: this.#config.jobs[className].common.mpPerIqPoint,
            attackSpeed: this.#config.jobs[className].common.initialAttackSpeed,
            movementSpeed: this.#config.jobs[className].common.initialMovementSpeed,
        });
    }
}
