import Logger from '@/core/infra/logger/Logger';
import Player from '../Player';
import { ApplyTypeEnum } from '@/core/enum/ApplyTypeEnum';
import Item from '../../item/Item';

export default class PlayerApplies {
    private readonly applies: Map<ApplyTypeEnum, (value: any) => void> = new Map();
    private readonly player: Player;
    private readonly logger: Logger;

    constructor(player: Player, logger: Logger) {
        this.player = player;
        this.logger = logger;
        this.init();
    }

    init() {
        this.applies.set(ApplyTypeEnum.ATT_SPEED, (value: number) => this.player.addAttackSpeed(value));
        this.applies.set(ApplyTypeEnum.MOV_SPEED, (value: number) => this.player.addMovementSpeed(value));
        this.applies.set(ApplyTypeEnum.HP_REGEN, (value: number) => this.player.addHealthRegen(value));
        this.applies.set(ApplyTypeEnum.SP_REGEN, (value: number) => this.player.addManaRegen(value));
    }

    addApply(type: ApplyTypeEnum, value: number) {
        const applyFunc = this.applies.get(type);

        if (applyFunc && typeof applyFunc === 'function') {
            applyFunc(Number(value));
        } else {
            this.logger.debug(`[PLAYER] Apply not implemented yet: ${type}`);
        }
    }

    addItemApplies(item: Item) {
        for (const { type, value } of item.getApplies()) {
            if (type === ApplyTypeEnum.NONE) continue;
            const applyFunc = this.applies.get(type);

            if (applyFunc && typeof applyFunc === 'function') {
                applyFunc(Number(value));
            } else {
                this.logger.debug(`[PLAYER] Apply not implemented yet: ${type}`);
            }
        }
    }

    removeItemApplies(item: Item) {
        for (const { type, value } of item.getApplies()) {
            if (type === ApplyTypeEnum.NONE) continue;
            const applyFunc = this.applies.get(type);

            if (applyFunc && typeof applyFunc === 'function') {
                applyFunc(-Number(value));
            } else {
                this.logger.debug(`[PLAYER] Apply not implemented yet: ${type}`);
            }
        }
    }
}
