import { expect } from 'chai';
import Item from '@/core/domain/entities/game/item/Item';
import { PlayerPoints } from '@/core/domain/entities/game/player/delegate/PlayerPoints';
import PlayerApplies from '@/core/domain/entities/game/player/delegate/PlayerApplies';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { ApplyTypeEnum } from '@/core/enum/ApplyTypeEnum';
import { RESTART_HEALTH } from '@/core/util/Constants';
import Character from '@/core/domain/entities/game/Character';
import AffectBitFlag from '@/core/util/AffectBitFlag';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';

const BASE_ATTACK_SPEED = 150;
const BASE_MOVEMENT_SPEED = 150;
const NINE_BLADES_ATT_SPEED = 19;
const SAW_TOOTH_ATT_SPEED = 114;

const makeItem = (applies: Array<{ type: ApplyTypeEnum; value: number }>) =>
    ({ getApplies: () => applies }) as unknown as Item;

const makeSubject = ({ health = 100, mana = 100 }: { health?: number; mana?: number } = {}) => {
    const worn: Array<Item> = [];
    const expirations = new Map<string, () => void>();

    const player: any = {
        isPlayer: () => true,
        isHorseRiding: () => false,
        getHorseLevel: () => 0,
        isAffectByFlag: Character.prototype.isAffectByFlag,
        activeAffects: new Map(),
        affectBitFlag: new AffectBitFlag(),
        addEventTimer: ({ id, onEndEventFunction }: { id: string; onEndEventFunction: () => void }) =>
            expirations.set(id, onEndEventFunction),
        removeEventTimer: (id: string) => expirations.delete(id),
        getPolymorphVnum: () => 0,
        getPlayerClass: () => 0,
        getSkillGroup: () => 0,
        levelUp: () => {},
        getEquippedItems: () => worn,
        getArmorValues: () => [],
        getWeaponValues: () => ({
            magic: { min: 0, max: 0, bonus: 0 },
            physic: { min: 0, max: 0, bonus: 0 },
        }),
    };
    Object.setPrototypeOf(player, Character.prototype);

    const points = new PlayerPoints(
        {
            level: 50,
            experience: 0,
            health,
            mana,
            stamina: 100,
            gold: 0,
            st: 60,
            ht: 55,
            dx: 50,
            iq: 45,
            givenStatusPoints: 0,
            availableStatusPoints: 0,
            hpPerLvl: 1,
            hpPerHtPoint: 1,
            mpPerLvl: 1,
            mpPerIqPoint: 1,
            baseHealth: 600,
            baseMana: 200,
            defensePerHtPoint: 1,
            attackPerStPoint: 1,
            attackPerDxPoint: 1,
            attackPerIqPoint: 1,
            baseAttackSpeed: BASE_ATTACK_SPEED,
            baseMovementSpeed: BASE_MOVEMENT_SPEED,
        } as any,
        {
            config: {
                MAX_POINTS: 90,
                MAX_LEVEL: 99,
                POINTS_PER_LEVEL: 3,
                jobs: { warrior: { common: { st: 6, ht: 6, dx: 6, iq: 6 } } },
            } as any,
            experienceManager: { getNeededExperience: () => 1000 } as any,
            player,
            mobManager: { getMobProto: () => null } as any,
        } as any,
    );

    player.addPoint = (point: PointsEnum, value: number) => points.addPoint(point, value);
    player.getPoint = (point: PointsEnum) => points.getPoint(point);

    const applies = new PlayerApplies(player, { debug: () => {} } as any);

    const equip = (item: Item) => {
        worn.push(item);
        applies.addItemApplies(item);
    };

    const unequip = (item: Item) => {
        worn.splice(worn.indexOf(item), 1);
        applies.removeItemApplies(item);
    };

    return { points, player, equip, unequip, expirations };
};

describe('PlayerPoints spawn reset (issue #251)', function () {
    describe('equipment applies', function () {
        it('should keep the attack speed of the gear worn at login', function () {
            const { points, equip } = makeSubject();
            const nineBlades = makeItem([{ type: ApplyTypeEnum.ATT_SPEED, value: NINE_BLADES_ATT_SPEED }]);

            equip(nineBlades);
            points.calcPointsAndResetValues();

            expect(points.getPoint(PointsEnum.ATTACK_SPEED)).to.equal(BASE_ATTACK_SPEED + NINE_BLADES_ATT_SPEED);
        });

        it('should keep the movement speed of the gear worn at login', function () {
            const { points, equip } = makeSubject();

            equip(makeItem([{ type: ApplyTypeEnum.MOV_SPEED, value: 20 }]));
            points.calcPointsAndResetValues();

            expect(points.getPoint(PointsEnum.MOVE_SPEED)).to.equal(BASE_MOVEMENT_SPEED + 20);
        });

        it('should return to the class base, not below it, when the gear worn at login is taken off', function () {
            const { points, equip, unequip } = makeSubject();
            const nineBlades = makeItem([{ type: ApplyTypeEnum.ATT_SPEED, value: NINE_BLADES_ATT_SPEED }]);

            equip(nineBlades);
            points.calcPointsAndResetValues();
            unequip(nineBlades);

            expect(points.getPoint(PointsEnum.ATTACK_SPEED)).to.equal(BASE_ATTACK_SPEED);
        });

        it('should hold the measured weapon swap at the values the gear adds up to', function () {
            const { points, equip, unequip } = makeSubject();
            const nineBlades = makeItem([{ type: ApplyTypeEnum.ATT_SPEED, value: NINE_BLADES_ATT_SPEED }]);
            const sawTooth = makeItem([{ type: ApplyTypeEnum.ATT_SPEED, value: SAW_TOOTH_ATT_SPEED }]);

            equip(nineBlades);
            points.calcPointsAndResetValues();
            expect(points.getPoint(PointsEnum.ATTACK_SPEED), 'after entering the world').to.equal(169);

            unequip(nineBlades);
            equip(sawTooth);
            expect(points.getPoint(PointsEnum.ATTACK_SPEED), 'wearing the second dagger').to.equal(264);

            unequip(sawTooth);
            expect(points.getPoint(PointsEnum.ATTACK_SPEED), 'wearing nothing').to.equal(BASE_ATTACK_SPEED);
        });

        it('should not count an apply the equipment no longer carries', function () {
            const { points, equip, unequip } = makeSubject();
            const item = makeItem([{ type: ApplyTypeEnum.ATT_SPEED, value: 40 }]);

            equip(item);
            unequip(item);
            points.calcPointsAndResetValues();

            expect(points.getPoint(PointsEnum.ATTACK_SPEED)).to.equal(BASE_ATTACK_SPEED);
        });

        it('keeps movement-speed bonuses above the wire limit reversible', function () {
            const { points, player, equip, unequip } = makeSubject();
            const item = makeItem([{ type: ApplyTypeEnum.MOV_SPEED, value: 150 }]);
            points.calcPointsAndResetValues();

            equip(item);
            expect(points.getPoint(PointsEnum.MOVE_SPEED)).to.equal(300);
            expect(player.getMovementSpeed()).to.equal(200);

            unequip(item);
            expect(points.getPoint(PointsEnum.MOVE_SPEED)).to.equal(BASE_MOVEMENT_SPEED);
        });

        it('should leave the applies that the reset does not touch alone', function () {
            const { points, equip } = makeSubject();

            equip(makeItem([{ type: ApplyTypeEnum.CRITICAL_PCT, value: 10 }]));
            points.calcPointsAndResetValues();

            expect(points.getPoint(PointsEnum.CRITICAL_CHANCE)).to.equal(10);
        });
    });

    describe('active speed affects', function () {
        for (const { point, apply, flag } of [
            {
                point: PointsEnum.ATTACK_SPEED,
                apply: ApplyTypeEnum.ATT_SPEED,
                flag: AffectBitsTypeEnum.ATT_SPEED_POTION,
            },
            { point: PointsEnum.MOVE_SPEED, apply: ApplyTypeEnum.MOV_SPEED, flag: AffectBitsTypeEnum.MOV_SPEED_POTION },
        ]) {
            it(`preserves ${PointsEnum[point]} through repeated resets and expires only the buff`, function () {
                const { points, player, equip, unequip, expirations } = makeSubject();
                const item = makeItem([{ type: apply, value: 20 }]);
                equip(item);
                points.calcPointsAndResetValues();
                player.addAffect({ flag, point, value: 30, duration: 60, eventId: 'speed-test' });
                expect(points.getPoint(point)).to.equal(200);

                points.calcPointsAndResetValues();
                points.calcPointsAndResetValues();
                expect(points.getPoint(point), 'equipment and the active buff survive the reset').to.equal(200);

                expirations.get('speed-test')!();
                expect(points.getPoint(point), 'expiration subtracts the buff once').to.equal(170);
                unequip(item);
                expect(points.getPoint(point), 'unequip returns to the class base').to.equal(150);
            });
        }
    });

    describe('health and mana', function () {
        it('should keep the stored health instead of healing to full on spawn', function () {
            const { points } = makeSubject({ health: 12, mana: 7 });

            points.calcPointsAndResetValues();

            expect(points.getPoint(PointsEnum.HEALTH)).to.equal(12);
            expect(points.getPoint(PointsEnum.MANA)).to.equal(7);
        });

        it('should clamp the stored health down to the maximum', function () {
            const { points } = makeSubject({ health: 999_999, mana: 999_999 });

            points.calcPointsAndResetValues();

            expect(points.getPoint(PointsEnum.HEALTH)).to.equal(points.getPoint(PointsEnum.MAX_HEALTH));
            expect(points.getPoint(PointsEnum.MANA)).to.equal(points.getPoint(PointsEnum.MAX_MANA));
        });

        it('should put a character stored with no health back on its feet', function () {
            const { points } = makeSubject({ health: 0 });

            points.calcPointsAndResetValues();

            expect(points.getPoint(PointsEnum.HEALTH)).to.equal(RESTART_HEALTH);
        });

        it('should still heal to full when the level is reset', function () {
            const { points } = makeSubject({ health: 12, mana: 7 });

            points.setPoint(PointsEnum.LEVEL, 40);

            expect(points.getPoint(PointsEnum.HEALTH)).to.equal(points.getPoint(PointsEnum.MAX_HEALTH));
            expect(points.getPoint(PointsEnum.MANA)).to.equal(points.getPoint(PointsEnum.MAX_MANA));
        });
    });
});
