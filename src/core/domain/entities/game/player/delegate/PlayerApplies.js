import ApplyTypeEnum from '../../../../../enum/ApplyTypeEnum.js';

export default class PlayerApplies {
    #applies = new Map();
    #player;
    #logger;

    constructor(player, logger) {
        this.#player = player;
        this.#logger = logger;
        this.#init();
    }

    #init() {
        this.#applies.set(ApplyTypeEnum.APPLY_ATT_SPEED, (value) => this.#player.addAttackSpeed(value));
        this.#applies.set(ApplyTypeEnum.APPLY_MOV_SPEED, (value) => this.#player.addMovementSpeed(value));
        this.#applies.set(ApplyTypeEnum.APPLY_HP_REGEN, (value) => this.#player.addHealthRegen(value));
        this.#applies.set(ApplyTypeEnum.APPLY_SP_REGEN, (value) => this.#player.addManaRegen(value));
    }

    addItemApplies(item) {
        for (const { type, value } of item.applies) {
            if (type === ApplyTypeEnum.APPLY_NONE) continue;
            const applyFunc = this.#applies.get(type);

            if (applyFunc && typeof applyFunc === 'function') {
                applyFunc(Number(value));
            } else {
                this.#logger.debug(`[PLAYER] Apply not implemented yet: ${type}`);
            }
        }
    }

    removeItemApplies(item) {
        for (const { type, value } of item.applies) {
            if (type === ApplyTypeEnum.APPLY_NONE) continue;
            const applyFunc = this.#applies.get(type);

            if (applyFunc && typeof applyFunc === 'function') {
                applyFunc(-Number(value));
            } else {
                this.#logger.debug(`[PLAYER] Apply not implemented yet: ${type}`);
            }
        }
    }
}
