import DropManager from '@/core/domain/manager/DropManager';
import MathUtil from '../../../util/MathUtil';
import Player from '../player/Player';
import Behavior from './Behavior';
import MonsterDiedEvent from './events/MonsterDiedEvent';
import MonsterMovedEvent from './events/MonsterMovedEvent';
import { Mob, MobParams } from './Mob';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import ExperienceManager from '@/core/domain/manager/ExperienceManager';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { FlyEnum } from '@/core/enum/FlyEnum';
import FlyEffectCreatedEvent from '../shared/event/FlyEffectCreatedEvent';
import { DamageTypeEnum } from '@/core/enum/DamageTypeEnum';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import BitFlag from '@/core/util/BitFlag';
import { DamageFlagEnum } from '@/core/enum/DamageFlagEnum';
import CharacterUpdatedEvent from '../shared/event/CharacterUpdatedEvent';
import { MobEnchantEnum } from '@/core/enum/MobEnchantEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { MobImmuneFlagEnum } from '@/core/enum/MobImmuneFlagEnum';
import { ItemWeaponSubTypeEnum } from '@/core/enum/ItemWeaponSubTypeEnum';
import { MobResistEnum } from '@/core/enum/MobResistEnum';

const MAX_DISTANCE_TO_GET_EXP = 5_000;

const weaponResistanceMapper = {
    [ItemWeaponSubTypeEnum.WEAPON_BELL]: MobResistEnum.BELL,
    [ItemWeaponSubTypeEnum.WEAPON_DAGGER]: MobResistEnum.DAGGER,
    [ItemWeaponSubTypeEnum.WEAPON_FAN]: MobResistEnum.FAN,
    [ItemWeaponSubTypeEnum.WEAPON_SWORD]: MobResistEnum.SWORD,
    [ItemWeaponSubTypeEnum.WEAPON_TWO_HANDED]: MobResistEnum.TWOHAND,
    [ItemWeaponSubTypeEnum.WEAPON_BOW]: MobResistEnum.BOW,
};

export default class Monster extends Mob {
    private readonly behavior: Behavior;
    private behaviorInitialized: boolean = false;
    private health: number = 0;

    private readonly dropManager: DropManager;
    private readonly experienceManager: ExperienceManager;

    constructor(
        params: Omit<MobParams, 'virtualId' | 'entityType'>,
        { animationManager, dropManager, experienceManager },
    ) {
        super(
            {
                ...params,
                entityType: EntityTypeEnum.MONSTER,
            },
            { animationManager },
        );
        this.dropManager = dropManager;
        this.experienceManager = experienceManager;
        this.health = this.maxHealth;
        this.behavior = new Behavior(this);
        this.initEvents();
    }

    private initEvents() {
        this.eventTimerManager.addTimer({
            id: 'REGEN_HEALTH',
            eventFunction: this.regenHealth.bind(this),
            options: {
                interval: this.regenCycle * 1_000,
            },
        });
    }

    protected applyAttackEffect(victim: Player) {
        const poisonChance = this.getChanceToApplyEnchant(MobEnchantEnum.POISON);
        const canApplyPoison = poisonChance > 0 && !victim.isAffectByFlag(AffectBitsTypeEnum.POISON);

        if (canApplyPoison && MathUtil.getRandomInt(1, 100) <= poisonChance) {
            victim.applyPoison(this);
        }

        const stunChance = this.getChanceToApplyEnchant(MobEnchantEnum.STUN);
        const canApplyStun = stunChance > 0 && !victim.isAffectByFlag(AffectBitsTypeEnum.STUN);

        if (canApplyStun && MathUtil.getRandomInt(1, 100) <= stunChance) {
            victim.applyStun();
        }

        const slowChance = this.getChanceToApplyEnchant(MobEnchantEnum.SLOW);
        const canApplySlow = slowChance > 0 && !victim.isAffectByFlag(AffectBitsTypeEnum.SLOW);

        if (canApplySlow && MathUtil.getRandomInt(1, 100) <= slowChance) {
            victim.applyStun();
        }
    }

    private sendUpdateEvent() {
        this.publish(
            new CharacterUpdatedEvent({
                affects: this.getAffectFlags(),
                attackSpeed: this.getAttackSpeed(),
                moveSpeed: this.getMovementSpeed(),
                bodyId: 0,
                hairId: 0,
                weaponId: 0,
                name: this.name,
                positionX: this.getPositionX(),
                positionY: this.getPositionY(),
                vid: this.getVirtualId(),
            }),
        );
    }

    applyFire(attacker: Player) {
        if (this.isAffectByFlag(AffectBitsTypeEnum.FIRE)) return;

        this.setAffectFlag(AffectBitsTypeEnum.FIRE);
        this.sendUpdateEvent();

        this.eventTimerManager.addTimer({
            id: 'FIRE_AFFECT',
            eventFunction: () => {
                const damage = this.maxHealth * 0.05;
                this.takeDamage(attacker, damage, DamageTypeEnum.FIRE);
            },
            options: {
                interval: 1_000,
                duration: 10_000,
            },
            onEndEventFunction: () => {
                this.removeAffectFlag(AffectBitsTypeEnum.FIRE);
                this.sendUpdateEvent();
            },
        });
    }

    applyPoison(attacker: Player) {
        if (this.isImmuneByFlag(MobImmuneFlagEnum.POISON)) return;
        if (this.isAffectByFlag(AffectBitsTypeEnum.POISON)) return;

        this.setAffectFlag(AffectBitsTypeEnum.POISON);
        this.sendUpdateEvent();

        this.eventTimerManager.addTimer({
            id: 'POISON_AFFECT',
            eventFunction: () => {
                const damage = this.maxHealth * 0.02;
                this.takeDamage(attacker, damage, DamageTypeEnum.POISON);
            },
            options: {
                interval: 1_000,
                duration: 20_000,
            },
            onEndEventFunction: () => {
                this.removeAffectFlag(AffectBitsTypeEnum.POISON);
                this.sendUpdateEvent();
            },
        });
    }

    applyStun() {
        if (this.isImmuneByFlag(MobImmuneFlagEnum.STUN)) return;
        if (this.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;

        this.setAffectFlag(AffectBitsTypeEnum.STUN);
        this.sendUpdateEvent();

        this.eventTimerManager.addTimer({
            id: 'STUN_AFFECT',
            eventFunction: () => {
                this.removeAffectFlag(AffectBitsTypeEnum.STUN);
                this.sendUpdateEvent();
            },
            options: {
                interval: 5_000,
                duration: 5_000,
                repeatCount: 1,
            },
        });
    }

    applySlow() {
        if (this.isImmuneByFlag(MobImmuneFlagEnum.SLOW)) return;
        if (this.isAffectByFlag(AffectBitsTypeEnum.SLOW)) return;
        const SLOW_VALUE = 30;
        this.setMovementSpeed(this.getMovementSpeed() - SLOW_VALUE);

        this.setAffectFlag(AffectBitsTypeEnum.SLOW);
        this.sendUpdateEvent();

        this.eventTimerManager.addTimer({
            id: 'SLOW_AFFECT',
            eventFunction: () => {
                this.setMovementSpeed(this.getMovementSpeed() + SLOW_VALUE);
                this.removeAffectFlag(AffectBitsTypeEnum.SLOW);
                this.sendUpdateEvent();
            },
            options: {
                interval: 10_000,
                duration: 10_000,
                repeatCount: 1,
            },
        });
    }

    regenHealth() {
        if (this.isAffectByFlag(AffectBitsTypeEnum.POISON)) return;
        if (this.state === EntityStateEnum.DEAD) return;
        if (this.health >= this.maxHealth) return;

        const amount = Math.floor(this.maxHealth * (this.regenPercent / 100));
        this.addHealth(Math.max(1, amount));
    }

    addHealth(value: number) {
        this.health = Math.min(this.health + Math.max(value, 0), this.maxHealth);
    }

    getHealthPercentage() {
        return Math.round(Math.max(0, Math.min(100, (this.health * 100) / this.maxHealth)));
    }

    private applyResistance(damage: number, resistance: number): number {
        return damage - damage * (resistance / 100);
    }

    private applyWeaponDamageResistance(attacker: Player, damage: number): number {
        const attackerWeapon = attacker.getWeapon();
        if (!attackerWeapon) return damage;

        const resistanceType = weaponResistanceMapper[attackerWeapon.getSubType()];
        if (resistanceType) {
            return this.applyResistance(damage, this.getResist(resistanceType));
        }

        console.log(`Invalid weapon type: ${attackerWeapon.getSubType()}`);
        return damage;
    }

    private applyCriticalDamage(attacker: Player, damage: number, damageFlags: BitFlag): number {
        const criticalChance = attacker.getPoint(PointsEnum.CRITICAL_PERCENTAGE);
        if (MathUtil.getRandomInt(1, 100) <= criticalChance) {
            damage *= 2;
            damageFlags.set(DamageFlagEnum.CRITICAL);
        }
        return damage;
    }

    private applyPenetrateDamage(attacker: Player, damage: number, damageFlags: BitFlag): number {
        const penetrateChance = attacker.getPoint(PointsEnum.PENETRATE_PERCENTAGE);
        if (MathUtil.getRandomInt(1, 100) <= penetrateChance) {
            damage += this.getDefense();
            damageFlags.set(DamageFlagEnum.PENETRATE);
        }
        return damage;
    }

    takeDamage(attacker: Player, damage: number, damageType: DamageTypeEnum) {
        this.state = EntityStateEnum.BATTLE;

        const damageFlags = new BitFlag();

        if (damageType === DamageTypeEnum.POISON) {
            damageFlags.set(DamageFlagEnum.POISON);
            damage -= damage * (this.getResist(MobResistEnum.POISON) / 100);
        } else {
            damageFlags.set(DamageFlagEnum.NORMAL);

            damage = this.applyCriticalDamage(attacker, damage, damageFlags);
            damage = this.applyPenetrateDamage(attacker, damage, damageFlags);
            damage = this.applyWeaponDamageResistance(attacker, damage);
            this.calculateAndSendHealthSteal(attacker, damage);
            this.calculateAndSendManaSteal(attacker, damage);
            this.calculateAndSendGoldSteal(attacker);
            this.calculateAndSendHealthHitRecovery(attacker, damage);
            this.calculateAndSendManaHitRecovery(attacker, damage);
        }

        attacker.sendDamageCaused({
            virtualId: this.virtualId,
            damage,
            damageFlags: damageFlags.getFlag(),
        });

        damage = damage > 0 ? damage : MathUtil.getRandomInt(1, 5);
        this.health -= damage;
        this.behavior.onDamage(attacker, damage);

        this.broadcastMyTarget();

        if (this.health <= 0) {
            this.die();
            this.reward();
            return;
        }

        this.state = EntityStateEnum.IDLE; //TODO: this behavior is incorrect
    }

    private calculateAndSendHealthSteal(attacker: Player, damage: number) {
        const attackerStealHealthValue = attacker.getPoint(PointsEnum.STEAL_HEALTH);

        if (attackerStealHealthValue > 0) {
            const stealHealthChance = 1;
            if (MathUtil.getRandomInt(1, 10) <= stealHealthChance) {
                const healthDamage = (Math.min(damage, Math.max(0, this.health)) * attackerStealHealthValue) / 100;
                this.health -= healthDamage;
                attacker.addHealth(healthDamage);
                this.publish(
                    new FlyEffectCreatedEvent({
                        fromVirtualId: this.virtualId,
                        toVirtualId: attacker.getVirtualId(),
                        type: FlyEnum.HEALTH_BIG,
                    }),
                );
                attacker.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: `[HEALTH_STEAL] you received ${healthDamage} of health`,
                });
            }
        }
    }

    private calculateAndSendManaSteal(attacker: Player, damage: number) {
        const attackerStealManaValue = attacker.getPoint(PointsEnum.STEAL_MANA);

        if (attackerStealManaValue > 0) {
            const stealManaChance = 1;
            if (MathUtil.getRandomInt(1, 10) <= stealManaChance) {
                const manaDamage =
                    (Math.min(damage, Math.max(0, this.maxMana || this.health)) * attackerStealManaValue) / 100;
                this.health -= manaDamage;
                attacker.addMana(manaDamage);
                this.publish(
                    new FlyEffectCreatedEvent({
                        fromVirtualId: this.virtualId,
                        toVirtualId: attacker.getVirtualId(),
                        type: FlyEnum.MANA_BIG,
                    }),
                );
                attacker.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: `[MANA_STEAL] you received ${manaDamage} of mana`,
                });
            }
        }
    }

    private calculateAndSendGoldSteal(attacker: Player) {
        const attackerStealGoldChance = attacker.getPoint(PointsEnum.STEAL_GOLD);

        if (MathUtil.getRandomInt(1, 100) <= attackerStealGoldChance) {
            const amount = MathUtil.getRandomInt(1, this.level * 50);
            attacker.addGold(amount);
            attacker.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `[GOLD_STEAL] you received ${amount} of gold`,
            });
        }
    }

    private calculateAndSendHealthHitRecovery(attacker: Player, damage: number) {
        const attackerHitHealthRecoveryPercentage = attacker.getPoint(PointsEnum.HIT_HEALTH_RECOVERY);

        if (attackerHitHealthRecoveryPercentage > 0) {
            const amount = Math.min(damage, this.health) * (attackerHitHealthRecoveryPercentage / 100);

            if (amount > 0) {
                attacker.addHealth(amount);
                this.publish(
                    new FlyEffectCreatedEvent({
                        fromVirtualId: this.virtualId,
                        toVirtualId: attacker.getVirtualId(),
                        type: FlyEnum.HEALTH_BIG,
                    }),
                );
                attacker.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: `[HEALTH_HIT_RECOVERY] you received ${amount} of health`,
                });
            }
        }
    }

    private calculateAndSendManaHitRecovery(attacker: Player, damage: number) {
        const attackerHitManaRecoveryPercentage = attacker.getPoint(PointsEnum.HIT_MANA_RECOVERY);

        if (attackerHitManaRecoveryPercentage > 0) {
            const amount = Math.min(damage, this.maxMana || this.health) * (attackerHitManaRecoveryPercentage / 100);

            if (amount > 0) {
                attacker.addMana(amount);
                this.publish(
                    new FlyEffectCreatedEvent({
                        fromVirtualId: this.virtualId,
                        toVirtualId: attacker.getVirtualId(),
                        type: FlyEnum.MANA_BIG,
                    }),
                );
                attacker.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: `[MANA_HIT_RECOVERY] you received ${amount} of mana`,
                });
            }
        }
    }

    reward() {
        const attacker = this.behavior.getTarget();
        const drops = this.dropManager.getDrops(attacker, this);

        for (const { item, count } of drops) {
            attacker.dropItem({ item, count });
        }

        this.giveExp();
    }

    giveExp() {
        const exp = this.getExp();

        const attackersSize = this.behavior.getTargets().size;
        const mostDamageAttacker = this.behavior.getTarget();

        for (const { player } of this.behavior.getTargets().values()) {
            let playerExp = exp / attackersSize;

            if (player === mostDamageAttacker) {
                playerExp *= 1.2;
            }

            const distance = MathUtil.calcDistance(
                player.getPositionX(),
                player.getPositionY(),
                this.getPositionX(),
                this.getPositionY(),
            );

            if (distance > MAX_DISTANCE_TO_GET_EXP) {
                continue;
            }

            const expToGive = this.experienceManager.calculateExpToGive(player, this, playerExp);

            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `Earned ${expToGive} of EXP after kill ${this.folder || this.name}`,
            });

            player.addExperience(expToGive);

            this.publish(
                new FlyEffectCreatedEvent({
                    fromVirtualId: this.virtualId,
                    toVirtualId: player.getVirtualId(),
                    type: FlyEnum.EXP,
                }),
            );
        }
    }

    die() {
        if (this.state === EntityStateEnum.DEAD) return;

        super.die();

        this.publish(
            new MonsterDiedEvent({
                entity: this,
            }),
        );
    }

    goto(x: number, y: number) {
        if (this.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;
        const rotation = MathUtil.calcRotationFromXY(x - this.positionX, y - this.positionY) / 5;
        super.gotoInternal(x, y, rotation);
        this.publish(
            new MonsterMovedEvent({
                params: {
                    positionX: x,
                    positionY: y,
                    arg: 0,
                    rotation,
                    time: performance.now(),
                    duration: this.movementDuration,
                },
                entity: this,
            }),
        );
    }

    tick() {
        if (this.state === EntityStateEnum.DEAD) return;
        if (this.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;

        super.tick();

        if (!this.behaviorInitialized) {
            this.behavior.init();
            this.behaviorInitialized = true;
        }

        this.behavior.tick();
    }

    getDefense() {
        return Math.floor(this.level * 3 + this.st * 4 + this.def);
    }

    getRespawnTimeInMs() {
        return this.group?.getSpawnConfig()?.getRespawnTimeInMs();
    }

    reset() {
        this.behaviorInitialized = false;
        this.state = EntityStateEnum.IDLE;
        this.health = this.maxHealth;
        this.initEvents();
        //TODO: spawn at original location
    }

    getAttack(): number {
        throw new Error('Method not implemented.');
    }

    attack(): void {
        throw new Error('Method not implemented.');
    }

    damage(): number {
        throw new Error('Method not implemented.');
    }
}
