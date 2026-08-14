import { expect } from 'chai';
import sinon from 'sinon';

import { SkillEnum } from '@/core/enum/SkillEnum';
import { SkillManager } from '@/core/domain/manager/SkillManager';
import { PlayerSkill } from '@/core/domain/entities/game/player/delegate/PlayerSkill';
import Player from '@/core/domain/entities/game/player/Player';

const PASSIVES = [
    ['LEADERSHIP', SkillEnum.LEADERSHIP],
    ['COMBO', SkillEnum.COMBO],
    ['MINING', SkillEnum.MINING],
    ['LANGUAGE1', SkillEnum.LANGUAGE1],
    ['LANGUAGE2', SkillEnum.LANGUAGE2],
    ['LANGUAGE3', SkillEnum.LANGUAGE3],
    ['POLYMORPH', SkillEnum.POLYMORPH],
] as const;

const createPlayer = (overrides: Record<string, unknown> = {}) =>
    ({
        isPolymorphed: sinon.stub().returns(false),
        getPoint: sinon.stub().returns(999999),
        addPoint: sinon.stub(),
        setPoint: sinon.stub(),
        getSkillGroup: sinon.stub().returns(1),
        isPlayer: sinon.stub().returns(true),
        isWarrior: sinon.stub().returns(true),
        isAssassin: sinon.stub().returns(false),
        isSura: sinon.stub().returns(false),
        isShaman: sinon.stub().returns(false),
        chat: sinon.stub(),
        sendPoints: sinon.stub(),
        sendSkillLevel: sinon.stub(),
        save: sinon.stub(),
        ...overrides,
    }) as unknown as Player;

describe('passive skill learning (issues #232 and #233)', () => {
    describe('SkillManager registration', () => {
        const manager = new SkillManager();

        PASSIVES.forEach(([name, skillNum]) => {
            it(`resolves a proto for ${name}, so its book is not a silent no-op`, () => {
                const proto = manager.getSkill(skillNum);

                expect(proto, `${name} must be registered`).to.not.equal(null);
                expect(proto!.isPassive(), `${name} is a passive`).to.equal(true);
            });
        });
    });

    describe('learning by book', () => {
        // A real SkillManager, so the specs cannot pass against an unregistered
        // proto the way a hand-made stub would.
        const build = (skillNum: SkillEnum) => {
            const player = createPlayer();
            const skills = new PlayerSkill({ player, skillManager: new SkillManager(), skills: [] });
            return { player, skills, skillNum };
        };

        it('raises a passive from level 0, which the MASTER-rank gate made impossible', () => {
            const { skills } = build(SkillEnum.LEADERSHIP);

            const learned = skills.learnSkillByBook(SkillEnum.LEADERSHIP, 100);

            expect(learned, 'the read is accepted').to.equal(true);
            expect(skills.getSkills()[SkillEnum.LEADERSHIP].level, 'and the level actually moves').to.equal(1);
        });

        it('keeps raising it up to the proto maxLevel', () => {
            const { skills } = build(SkillEnum.COMBO);
            const max = new SkillManager().getSkill(SkillEnum.COMBO)!.maxLevel;

            for (let i = 0; i < max + 2; i++) skills.learnSkillByBook(SkillEnum.COMBO, 100);

            expect(skills.getSkills()[SkillEnum.COMBO].level, 'stops at the proto cap').to.equal(max);
        });

        it('still refuses an active skill that has not reached MASTER rank', () => {
            const { skills } = build(SkillEnum.THREE_WAY_CUT);

            skills.learnSkillByBook(SkillEnum.THREE_WAY_CUT, 100);

            expect(
                skills.getSkills()[SkillEnum.THREE_WAY_CUT].level,
                'the rank gate must survive for active skills',
            ).to.equal(0);
        });
    });

    describe('read cooldown', () => {
        it('stamps the deadline in epoch seconds, not milliseconds since process start', () => {
            const player = createPlayer();
            const skills = new PlayerSkill({ player, skillManager: new SkillManager(), skills: [] });

            skills.setSkillNextReadTime(SkillEnum.LEADERSHIP, Math.floor(Date.now() / 1000) + 60);

            const deadline = skills.getSkills()[SkillEnum.LEADERSHIP].timeToNextRead;

            expect(deadline, 'an epoch-seconds deadline is ~1.7e9, a performance.now one is ~1e5').to.be.greaterThan(
                1_600_000_000,
            );
            expect(deadline, 'and must stay inside writeInt32LE range').to.be.lessThan(2_147_483_647);
        });
    });
});
