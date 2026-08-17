import { expect } from 'chai';
import { MobPoints } from '@/core/domain/entities/game/mob/delegate/MobPoints';
import MonsterBattle from '@/core/domain/entities/game/mob/delegate/battle/MonsterBattle';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import { BattleTypeEnum } from '@/core/enum/BattleTypeEnum';

const logger: any = { info: () => {}, error: () => {}, debug: () => {} };

// Wild Dog (vnum 101): the worked example from the issue.
const wildDogProto: any = {
    move_speed: 100,
    attack_speed: 100,
    dx: 6,
    ht: 3,
    iq: 3,
    st: 3,
    level: 1,
    max_hp: 100,
    def: 4,
    damage_min: 22,
    damage_max: 22,
    dam_multiply: 1,
};

describe('Monster melee damage', () => {
    describe('MobPoints attack grade', () => {
        it('should be level*2 + st*2, matching the original ComputeBattlePoints', () => {
            const points = new MobPoints(wildDogProto);
            points.calcPoints();

            // 1*2 + 3*2 = 8. The old formula folded the damage roll and
            // level*3 + st*4 in here, which is what this pins against.
            expect(points.getPoint(PointsEnum.ATTACK_GRADE)).to.equal(8);
        });

        it('should not fold the damage roll into the grade (grade is deterministic)', () => {
            const a = new MobPoints(wildDogProto);
            const b = new MobPoints(wildDogProto);
            a.calcPoints();
            b.calcPoints();

            expect(a.getPoint(PointsEnum.ATTACK_GRADE)).to.equal(b.getPoint(PointsEnum.ATTACK_GRADE));
        });
    });

    describe('MobPoints defense grade', () => {
        // Chief Orc (vnum 691): level 50, ht 63, def 57 in mobs.json.
        const chiefOrcProto: any = { ...wildDogProto, level: 50, ht: 63, st: 40, def: 57, max_hp: 5000 };

        it('should be level + ht + def, matching the original ComputeBattlePoints', () => {
            const points = new MobPoints(wildDogProto);
            points.calcPoints();

            // 1 + 3 + 4 = 8. The old formula was level*3 + ht*4 + def = 19.
            expect(points.getPoint(PointsEnum.DEFENSE)).to.equal(8);
        });

        it('should not scale the level and ht terms, which suppressed player damage on real mobs', () => {
            const points = new MobPoints(chiefOrcProto);
            points.calcPoints();

            // 50 + 63 + 57 = 170, against 50*3 + 63*4 + 57 = 459 before.
            expect(points.getPoint(PointsEnum.DEFENSE)).to.equal(170);
        });
    });

    describe('MonsterBattle.meleeAttack', () => {
        // attackRating 90 on both sides gives a clean fAR of exactly 0.7:
        // (90+210)/300 - ((90*2+5)/(90+95))*0.3 = 1 - 0.3 = 0.7
        const createAttacker = (overrides: any = {}) =>
            ({
                getBattleType: () => BattleTypeEnum.MELEE,
                getAttackRange: () => 100,
                getPositionX: () => 0,
                getPositionY: () => 0,
                getAttackRating: () => 90,
                getLevel: () => 1,
                getDamageMin: () => 22,
                getDamageMax: () => 22,
                getAttack: () => 8, // grade = level*2 + st*2
                getDamMultiply: () => 1,
                getEnchant: () => 0,
                isImmuneByFlag: () => false,
                isDeathBlower: () => false,
                takeDamage: () => {},
                ...overrides,
            }) as any;

        const createVictim = () => {
            let received: number | null = null;
            return {
                received: () => received,
                victim: {
                    getPositionX: () => 0,
                    getPositionY: () => 0,
                    getAttackRating: () => 90,
                    getDefense: () => 0,
                    getPoint: () => 0,
                    isAffectByFlag: () => false,
                    debugChat: () => {},
                    sendDamageReceived: () => {},
                    takeDamage: (_attacker: any, damage: number) => {
                        received = damage;
                    },
                } as any,
            };
        };

        it('rolls the damage per hit and doubles it, matching CalcMeleeDamage', () => {
            // grade 8 + roll(22*2=44) - level*2(2) = 50; *0.7 = 35; +2 = 37; *1 = 37
            const battle = new MonsterBattle(createAttacker(), logger);
            const { victim, received } = createVictim();

            battle.execute(AttackTypeEnum.NORMAL, victim);

            expect(received()).to.equal(37);
        });

        it('applies the mob damage multiply on top', () => {
            // same 37, then *2 = 74
            const battle = new MonsterBattle(createAttacker({ getDamMultiply: () => 2 }), logger);
            const { victim, received } = createVictim();

            battle.execute(AttackTypeEnum.NORMAL, victim);

            expect(received()).to.equal(74);
        });

        it('subtracts the victim defense from the doubled-roll attack', () => {
            const battle = new MonsterBattle(createAttacker(), logger);
            let received: number | null = null;
            const victim: any = {
                getPositionX: () => 0,
                getPositionY: () => 0,
                getAttackRating: () => 90,
                getDefense: () => 10,
                getPoint: () => 0,
                isAffectByFlag: () => false,
                debugChat: () => {},
                sendDamageReceived: () => {},
                takeDamage: (_a: any, damage: number) => {
                    received = damage;
                },
            };

            battle.execute(AttackTypeEnum.NORMAL, victim);

            // 37 - 10 = 27
            expect(received).to.equal(27);
        });
    });
});
