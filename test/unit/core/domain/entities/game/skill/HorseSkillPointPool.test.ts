import { expect } from 'chai';
import sinon from 'sinon';

import { PointsEnum } from '@/core/enum/PointsEnum';
import { SkillEnum } from '@/core/enum/SkillEnum';
import { SkillTypeEnum } from '@/core/enum/SkillTypeEnum';
import { SkillManager } from '@/core/domain/manager/SkillManager';
import Player from '@/core/domain/entities/game/player/Player';
import { PlayerSkill } from '@/core/domain/entities/game/player/delegate/PlayerSkill';
import { PlayerPoints } from '@/core/domain/entities/game/player/delegate/PlayerPoints';

const HORSE_SKILLS = [
    ['Charge', SkillEnum.HORSE_CHARGE],
    ['Escape', SkillEnum.HORSE_ESCAPE],
    ['Wild Attack', SkillEnum.HORSE_WILDATTACK],
    ['Wild Attack Range', SkillEnum.HORSE_WILDATTACK_RANGE],
] as const;

const createPlayer = (overrides: Record<string, unknown> = {}): Player =>
    ({
        isPolymorphed: sinon.stub().returns(false),
        getPoint: sinon.stub().returns(999999),
        addPoint: sinon.stub(),
        setPoint: sinon.stub(),
        getSkillGroup: sinon.stub().returns(1),
        isPlayer: sinon.stub().returns(true),
        chat: sinon.stub(),
        sendPoints: sinon.stub(),
        sendSkillLevel: sinon.stub(),
        save: sinon.stub(),
        ...overrides,
    }) as unknown as Player;

describe('Horse skills spend riding points (issue #206)', () => {
    const skillManager = new SkillManager();

    for (const [name, skillNum] of HORSE_SKILLS) {
        it(`${name} is registered as a HORSE skill, not a plain active one`, () => {
            expect(skillManager.getSkill(skillNum)?.type).to.equal(SkillTypeEnum.HORSE);
        });
    }

    it('deducts a riding point when levelling one up, leaving the job pool alone', () => {
        const addPoint = sinon.stub();
        const player = createPlayer({ addPoint });
        const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });

        playerSkill.skillLevelUp(SkillEnum.HORSE_CHARGE, 'POINT');

        expect(addPoint.calledOnceWith(PointsEnum.HORSE_SKILL, -1)).to.be.true;
        expect(addPoint.calledWith(PointsEnum.SKILL, -1), 'the job skill pool must not be touched').to.be.false;
    });

    it('refuses to level one up without riding points, however many job points the player has', () => {
        const addPoint = sinon.stub();
        const getPoint = sinon.stub().callsFake((point: PointsEnum) => (point === PointsEnum.HORSE_SKILL ? 0 : 999999));
        const player = createPlayer({ addPoint, getPoint });
        const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });

        playerSkill.skillLevelUp(SkillEnum.HORSE_CHARGE, 'POINT');

        expect(addPoint.called).to.be.false;
        expect(playerSkill.getSkills()[SkillEnum.HORSE_CHARGE].level).to.equal(0);
    });

    it('actually moves the riding pool, not just the call', () => {
        const points = new PlayerPoints({ horseSkill: 3 } as any, {
            config: {} as any,
            player: { getHorseLevel: () => 21 } as any,
        });
        const player = createPlayer({
            getPoint: (point: PointsEnum) =>
                point === PointsEnum.HORSE_SKILL || point === PointsEnum.SKILL ? points.getPoint(point) : 999999,
            addPoint: (point: PointsEnum, value: number) => points.addPoint(point, value),
        });
        const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });

        playerSkill.skillLevelUp(SkillEnum.HORSE_CHARGE, 'POINT');

        expect(points.getPoint(PointsEnum.HORSE_SKILL), 'a riding point is really spent').to.equal(2);
    });

    it('still treats them as castable active skills', () => {
        for (const [, skillNum] of HORSE_SKILLS) {
            expect(skillManager.getSkill(skillNum)?.isActive(), `skill ${skillNum}`).to.be.true;
            expect(skillManager.getSkill(skillNum)?.isPassive(), `skill ${skillNum}`).to.be.false;
        }
    });
});
