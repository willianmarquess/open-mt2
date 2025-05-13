import Logger from '@/core/infra/logger/Logger';
import Player from '../Player';
import { ApplyTypeEnum } from '@/core/enum/ApplyTypeEnum';
import Item from '../../item/Item';
import { PointsEnum } from '@/core/enum/PointsEnum';

export default class PlayerApplies {
    private readonly applies: Map<ApplyTypeEnum, (value: any) => void> = new Map();
    private readonly player: Player;
    private readonly logger: Logger;

    constructor(player: Player, logger: Logger) {
        this.player = player;
        this.logger = logger;
        this.init();
    }

    private init() {
        this.applies.set(ApplyTypeEnum.ATT_SPEED, (value: number) =>
            this.player.addPoint(PointsEnum.ATTACK_SPEED, value),
        );
        this.applies.set(ApplyTypeEnum.MOV_SPEED, (value: number) =>
            this.player.addPoint(PointsEnum.MOVE_SPEED, value),
        );
        this.applies.set(ApplyTypeEnum.HP_REGEN, (value: number) => this.player.addPoint(PointsEnum.HP_REGEN, value));
        this.applies.set(ApplyTypeEnum.SP_REGEN, (value: number) => this.player.addPoint(PointsEnum.MANA_REGEN, value));
        this.applies.set(ApplyTypeEnum.STUN_PCT, (value: number) =>
            this.player.addPoint(PointsEnum.STUN_CHANCE, value),
        );
        this.applies.set(ApplyTypeEnum.POISON_PCT, (value: number) =>
            this.player.addPoint(PointsEnum.POISON_CHANCE, value),
        );
        this.applies.set(ApplyTypeEnum.MAX_HP_PCT, (value: number) =>
            this.player.addPoint(PointsEnum.MAX_HP_PCT, value),
        );
        this.applies.set(ApplyTypeEnum.CRITICAL_PCT, (value: number) =>
            this.player.addPoint(PointsEnum.CRITICAL_CHANCE, value),
        );
        this.applies.set(ApplyTypeEnum.PENETRATE_PCT, (value: number) =>
            this.player.addPoint(PointsEnum.PENETRATE_CHANCE, value),
        );
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
