import Logger from '@/core/infra/logger/Logger';
import Player from '../Player';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import MathUtil from '@/core/domain/util/MathUtil';
import { ItemTypeEnum } from '@/core/enum/ItemTypeEnum';
import { ItemSubTypeEnum } from '@/core/enum/ItemSubTypeEnum';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import { DamageTypeEnum } from '@/core/enum/DamageTypeEnum';
import Monster from '../../mob/Monster';
import AffectAddedEvent from '../../shared/event/AffectAddedEvent';
import { AffectTypeEnum } from '@/core/enum/AffectTypeEnum';

export default class PlayerBattle {
    private readonly player: Player;
    private readonly logger: Logger;

    constructor(player: Player, logger: Logger) {
        this.player = player;
        this.logger = logger;
    }

    attack(victim: Player | Monster, attackType: AttackTypeEnum) {
        switch (attackType) {
            case AttackTypeEnum.NORMAL:
                //we need to verify the battle type before to do this
                this.meleeAttack(victim);
                break;

            default:
                this.logger.info(`[PlayerBattle] Attack ${attackType} not implemented yet.`);
                break;
        }
    }

    calcAttackRating(victim: Player | Monster) {
        const attackerRating = this.player.getAttackRating();
        const victimRating = victim.getAttackRating();
        const attackRating =
            (attackerRating + 210.0) / 300.0 - (((victimRating * 2 + 5) / (victimRating + 95)) * 3.0) / 10.0;
        return attackRating;
    }

    meleeAttack(victim: Player | Monster) {
        const MAX_DISTANCE = 500;
        const distance = MathUtil.calcDistance(
            this.player.getPositionX(),
            this.player.getPositionY(),
            victim.getPositionX(),
            victim.getPositionY(),
        );

        if (distance > MAX_DISTANCE) {
            this.logger.info(`[PlayerBattle] Very far from the victim.`);
            return;
        }

        const weapon = this.player.getWeapon();

        if (weapon && weapon.getType() === ItemTypeEnum.ITEM_WEAPON) {
            switch (weapon.getSubType()) {
                case ItemSubTypeEnum.WEAPON_SWORD:
                case ItemSubTypeEnum.WEAPON_DAGGER:
                case ItemSubTypeEnum.WEAPON_TWO_HANDED:
                case ItemSubTypeEnum.WEAPON_BELL:
                case ItemSubTypeEnum.WEAPON_FAN:
                case ItemSubTypeEnum.WEAPON_MOUNT_SPEAR:
                    break;
                case ItemSubTypeEnum.WEAPON_BOW:
                    this.logger.info(`[PlayerBattle] Melee attack cant handle bow attacks.`);
                    return;
                default:
                    this.logger.info(`[PlayerBattle] Invalid weapon subtype: ${weapon.getSubType()}.`);
                    return;
            }
        }

        const attackRating = this.calcAttackRating(victim);

        //calculate attack for polymorph character

        const basePlayerAttack = this.player.getAttack();

        const attack = Math.floor(basePlayerAttack * attackRating);

        this.applyAttackEffect(victim);

        //apply affects: poison, stun, slow, fire
        //calculate bonus damage: mob (monster, animals, trees, demons etc)
        //calculate bonus damage: player (humanoids, races)

        const defense = victim.getDefense();

        const damage = Math.max(0, attack - defense);

        this.player.chat({
            message: `your damage is: ${damage}`,
            messageType: ChatMessageTypeEnum.NORMAL,
        });

        victim.takeDamage(this.player, damage, DamageTypeEnum.NORMAL);
    }

    private applyAttackEffect(victim: Player | Monster) {
        const poisonChance = this.player.getPoint(PointsEnum.POISON);
        const canApplyPoison = poisonChance > 0 && !victim.isAffectByFlag(AffectBitsTypeEnum.POISON);

        if (canApplyPoison && MathUtil.getRandomInt(1, 100) <= poisonChance) {
            victim.applyPoison(this.player);
        }

        const stunChance = this.player.getPoint(PointsEnum.STUN);
        const canApplyStun = stunChance > 0 && !victim.isAffectByFlag(AffectBitsTypeEnum.STUN);

        if (canApplyStun && MathUtil.getRandomInt(1, 100) <= stunChance) {
            victim.applyStun();
        }

        const slowChance = this.player.getPoint(PointsEnum.SLOW);
        const canApplySlow = slowChance > 0 && !victim.isAffectByFlag(AffectBitsTypeEnum.SLOW);

        if (canApplySlow && MathUtil.getRandomInt(1, 100) <= slowChance) {
            victim.applySlow();
        }

        //TODO: add fire affect
    }

    applyPoison(attacker: Player | Monster) {
        if (this.player.isAffectByFlag(AffectBitsTypeEnum.POISON)) return;

        this.player.setAffectFlag(AffectBitsTypeEnum.POISON);
        this.player.updateView();

        this.player.publish(
            new AffectAddedEvent({
                type: AffectTypeEnum.POISON,
                apply: PointsEnum.NONE,
                value: 0,
                flag: AffectBitsTypeEnum.POISON,
                duration: 10,
                manaCost: 0,
            }),
        );

        this.player.getEventTimerManager().addTimer({
            id: 'POISON_AFFECT',
            eventFunction: () => {
                const baseDamage = this.player.getMaxHealth() * 0.05;
                const damage = Math.max(
                    0,
                    baseDamage - baseDamage * (this.player.getPoint(PointsEnum.POISON_REDUCE) / 100),
                );
                this.player.takeDamage(attacker, damage, DamageTypeEnum.POISON);
            },
            options: {
                interval: 1_000,
                duration: 10_000,
            },
            onEndEventFunction: () => {
                this.player.removeAffectFlag(AffectBitsTypeEnum.POISON);
                this.player.updateView();
            },
        });
    }

    applyStun() {
        if (this.player.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;

        this.player.setAffectFlag(AffectBitsTypeEnum.STUN);
        this.player.updateView();

        this.player.publish(
            new AffectAddedEvent({
                type: AffectTypeEnum.STUN,
                apply: PointsEnum.NONE,
                value: 0,
                flag: AffectBitsTypeEnum.STUN,
                duration: 2,
                manaCost: 0,
            }),
        );

        this.player.getEventTimerManager().addTimer({
            id: 'STUN_AFFECT',
            eventFunction: () => {
                this.player.removeAffectFlag(AffectBitsTypeEnum.STUN);
                this.player.updateView();
            },
            options: {
                interval: 2_000,
                duration: 2_000,
                repeatCount: 1,
            },
        });
    }

    applySlow() {
        if (this.player.isAffectByFlag(AffectBitsTypeEnum.SLOW)) return;

        const SLOW_VALUE = 30;
        this.player.setMovementSpeed(this.player.getMovementSpeed() - SLOW_VALUE);

        this.player.setAffectFlag(AffectBitsTypeEnum.SLOW);
        this.player.updateView();

        this.player.publish(
            new AffectAddedEvent({
                type: AffectTypeEnum.SLOW,
                apply: PointsEnum.MOVE_SPEED,
                value: SLOW_VALUE,
                flag: AffectBitsTypeEnum.SLOW,
                duration: 30,
                manaCost: 0,
            }),
        );

        this.player.getEventTimerManager().addTimer({
            id: 'SLOW_AFFECT',
            eventFunction: () => {
                this.player.setMovementSpeed(this.player.getMovementSpeed() + SLOW_VALUE);
                this.player.removeAffectFlag(AffectBitsTypeEnum.SLOW);
                this.player.updateView();
            },
            options: {
                interval: 10_000,
                duration: 10_000,
                repeatCount: 1,
            },
        });
    }

    applyFire(attacker: Player | Monster) {
        if (this.player.isAffectByFlag(AffectBitsTypeEnum.FIRE)) return;

        this.player.setAffectFlag(AffectBitsTypeEnum.FIRE);
        this.player.updateView();

        this.player.publish(
            new AffectAddedEvent({
                type: AffectTypeEnum.FIRE,
                apply: PointsEnum.NONE,
                value: 0,
                flag: AffectBitsTypeEnum.FIRE,
                duration: 5,
                manaCost: 0,
            }),
        );

        this.player.getEventTimerManager().addTimer({
            id: 'FIRE_AFFECT',
            eventFunction: () => {
                const baseDamage = this.player.getMaxHealth() * 0.07;
                const damage = Math.max(
                    0,
                    baseDamage - baseDamage * (this.player.getPoint(PointsEnum.RESIST_FIRE) / 100),
                );
                this.player.takeDamage(attacker, damage, DamageTypeEnum.FIRE);
            },
            options: {
                interval: 1_000,
                duration: 5_000,
            },
            onEndEventFunction: () => {
                this.player.removeAffectFlag(AffectBitsTypeEnum.FIRE);
                this.player.updateView();
            },
        });
    }
}
