import { expect } from 'chai';
import sinon, { SinonSandbox, SinonStub } from 'sinon';

import { PointsEnum } from '@/core/enum/PointsEnum';
import { SkillEnum } from '@/core/enum/SkillEnum';
import { SkillTypeEnum } from '@/core/enum/SkillTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { SkillManager } from '@/core/domain/manager/SkillManager';
import MathUtil from '@/core/domain/util/MathUtil';
import { Skill } from '@/core/domain/entities/game/skill/Skill';
import Player from '@/core/domain/entities/game/player/Player';
import { PlayerSkill } from '@/core/domain/entities/game/player/delegate/PlayerSkill';

const RANK = {
    NORMAL: 0,
    MASTER: 1,
    GRAND_MASTER: 2,
    PERFECT_MASTER: 3,
} as const;

const SKILL_MAX_LEVEL = 40;
const TEST_SKILL = SkillEnum.THREE_WAY_CUT;
const NOW_SECONDS = 1_750_000_000;

function createSkillProto(overrides: Record<string, unknown> = {}): Skill {
    return {
        type: SkillTypeEnum.ACTIVE,
        id: TEST_SKILL,
        maxLevel: 40,
        levelStep: 1,
        levelLimit: 0,
        range: 0,
        flags: new Set<SkillFlagsEnum>(),
        applies: new Set(),
        affects: new Set(),
        canBeUsedBy: sinon.stub().returns(true),
        isPassive: sinon.stub().returns(false),
        isActive: sinon.stub().returns(true),
        ...overrides,
    } as unknown as Skill;
}

function createPlayer(overrides: Record<string, unknown> = {}): Player {
    return {
        isPolymorphed: sinon.stub().returns(false),
        getPoint: sinon.stub().returns(999999),
        addPoint: sinon.stub(),
        setPoint: sinon.stub(),
        getSkillGroup: sinon.stub().returns(1),
        chat: sinon.stub(),
        sendPoints: sinon.stub(),
        sendSkillLevel: sinon.stub(),
        save: sinon.stub(),
        ...overrides,
    } as unknown as Player;
}

function createSkillManager(skill: Skill | undefined): SkillManager {
    return {
        getSkill: sinon.stub().returns(skill),
    } as unknown as SkillManager;
}

function setSkillState(
    playerSkill: PlayerSkill,
    skillNum: SkillEnum,
    state: Partial<{ rank: number; level: number; timeToNextRead: number; readCount: number }>,
) {
    Object.assign(playerSkill.getSkills()[skillNum], state);
}

describe('PlayerSkill', () => {
    let sandbox: SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('initial state', () => {
        it('initializes 255 skill slots with default values', () => {
            const playerSkill = new PlayerSkill({
                player: createPlayer(),
                skillManager: createSkillManager(undefined),
                skills: [],
            });

            const skills = playerSkill.getSkills();

            expect(skills).to.have.lengthOf(255);
            expect(skills[0]).to.deep.equal({ rank: RANK.NORMAL, level: 0, timeToNextRead: 0, readCount: 0 });
        });

        it('does not share object references between skill slots (regression: Array.fill bug)', () => {
            const playerSkill = new PlayerSkill({
                player: createPlayer(),
                skillManager: createSkillManager(undefined),
                skills: [],
            });

            playerSkill.getSkills()[0].level = 10;

            expect(playerSkill.getSkills()[1].level).to.equal(0);
        });
    });

    describe('setSkillLevel', () => {
        let playerSkill: PlayerSkill;

        beforeEach(() => {
            playerSkill = new PlayerSkill({
                player: createPlayer(),
                skillManager: createSkillManager(undefined),
                skills: [],
            });
        });

        it('sets the level as-is when below SKILL_MAX_LEVEL', () => {
            playerSkill.setSkillLevel(TEST_SKILL, 15);
            expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(15);
        });

        it('clamps the level to SKILL_MAX_LEVEL when exceeding it', () => {
            playerSkill.setSkillLevel(TEST_SKILL, 999);
            expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(SKILL_MAX_LEVEL);
        });

        it('sets rank to NORMAL when level < 20', () => {
            playerSkill.setSkillLevel(TEST_SKILL, 10);
            expect(playerSkill.getSkills()[TEST_SKILL].rank).to.equal(RANK.NORMAL);
        });

        it('sets rank to MASTER when 20 <= level < 30', () => {
            playerSkill.setSkillLevel(TEST_SKILL, 25);
            expect(playerSkill.getSkills()[TEST_SKILL].rank).to.equal(RANK.MASTER);
        });

        it('sets rank to GRAND_MASTER when 30 <= level < 40', () => {
            playerSkill.setSkillLevel(TEST_SKILL, 35);
            expect(playerSkill.getSkills()[TEST_SKILL].rank).to.equal(RANK.GRAND_MASTER);
        });

        it('sets rank to PERFECT_MASTER when level >= 40', () => {
            playerSkill.setSkillLevel(TEST_SKILL, 40);
            expect(playerSkill.getSkills()[TEST_SKILL].rank).to.equal(RANK.PERFECT_MASTER);
        });

        it('evaluates rank against the raw parameter, even when the stored level is clamped', () => {
            playerSkill.setSkillLevel(TEST_SKILL, 999);
            expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(SKILL_MAX_LEVEL);
            expect(playerSkill.getSkills()[TEST_SKILL].rank).to.equal(RANK.PERFECT_MASTER);
        });

        it('creates a new slot when skillNum is out of the pre-filled range', () => {
            const outOfRangeSkill = 300 as unknown as SkillEnum;

            playerSkill.setSkillLevel(outOfRangeSkill, 25);

            expect(playerSkill.getSkills()[outOfRangeSkill]).to.deep.equal({
                rank: RANK.MASTER,
                level: 25,
                timeToNextRead: 0,
                readCount: 0,
            });
        });
    });

    describe('skillLevelUp', () => {
        it('does nothing when the player is polymorphed', () => {
            const player = createPlayer({ isPolymorphed: sinon.stub().returns(true) });
            const skillManager = createSkillManager(createSkillProto());
            const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
            setSkillState(playerSkill, TEST_SKILL, { rank: RANK.NORMAL, level: 5 });

            playerSkill.skillLevelUp(TEST_SKILL, 'POINT');

            expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(5);
            expect((player.sendPoints as SinonStub).called).to.be.false;
        });

        it('does nothing when the skill is not learnable (skillManager returns no proto)', () => {
            const player = createPlayer();
            const skillManager = createSkillManager(undefined);
            const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
            setSkillState(playerSkill, TEST_SKILL, { rank: RANK.NORMAL, level: 5 });

            playerSkill.skillLevelUp(TEST_SKILL, 'POINT');

            expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(5);
        });

        it('does nothing when the skill slot does not exist yet', () => {
            const outOfRangeSkill = 300 as unknown as SkillEnum;
            const player = createPlayer();
            const skillManager = createSkillManager(createSkillProto());
            const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });

            playerSkill.skillLevelUp(outOfRangeSkill, 'POINT');

            expect((player.sendPoints as SinonStub).called).to.be.false;
        });

        it('does nothing when the skill is already PERFECT_MASTER', () => {
            const player = createPlayer();
            const skillManager = createSkillManager(createSkillProto());
            const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
            setSkillState(playerSkill, TEST_SKILL, { rank: RANK.PERFECT_MASTER, level: 40 });

            playerSkill.skillLevelUp(TEST_SKILL, 'POINT');

            expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(40);
            expect((player.sendPoints as SinonStub).called).to.be.false;
        });

        it('rejects BOOK method when rank is not MASTER', () => {
            const player = createPlayer();
            const skillManager = createSkillManager(createSkillProto());
            const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
            setSkillState(playerSkill, TEST_SKILL, { rank: RANK.NORMAL, level: 5 });

            playerSkill.skillLevelUp(TEST_SKILL, 'BOOK');

            expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(5);
        });

        it('accepts BOOK method when rank is MASTER', () => {
            const player = createPlayer();
            const skillManager = createSkillManager(createSkillProto());
            const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
            setSkillState(playerSkill, TEST_SKILL, { rank: RANK.MASTER, level: 25 });

            playerSkill.skillLevelUp(TEST_SKILL, 'BOOK');

            expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(26);
        });

        it('rejects POINT method when rank is not NORMAL', () => {
            const player = createPlayer();
            const skillManager = createSkillManager(createSkillProto());
            const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
            setSkillState(playerSkill, TEST_SKILL, { rank: RANK.MASTER, level: 25 });

            playerSkill.skillLevelUp(TEST_SKILL, 'POINT');

            expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(25);
        });

        it('rejects POINT method when the skill has DISABLE_BY_POINT_UP flag', () => {
            const player = createPlayer();
            const skillProto = createSkillProto({ flags: new Set([SkillFlagsEnum.DISABLE_BY_POINT_UP]) });
            const skillManager = createSkillManager(skillProto);
            const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
            setSkillState(playerSkill, TEST_SKILL, { rank: RANK.NORMAL, level: 5 });

            playerSkill.skillLevelUp(TEST_SKILL, 'POINT');

            expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(5);
        });

        it('does nothing when player level is below skillProto.levelLimit', () => {
            const player = createPlayer({
                getPoint: sinon.stub().callsFake((point: PointsEnum) => (point === PointsEnum.LEVEL ? 10 : 999999)),
            });
            const skillProto = createSkillProto({ levelLimit: 50 });
            const skillManager = createSkillManager(skillProto);
            const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
            setSkillState(playerSkill, TEST_SKILL, { rank: RANK.NORMAL, level: 5 });

            playerSkill.skillLevelUp(TEST_SKILL, 'POINT');

            expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(5);
        });

        it('does nothing when the player has no skill group', () => {
            const player = createPlayer({ getSkillGroup: sinon.stub().returns(0) });
            const skillManager = createSkillManager(createSkillProto());
            const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
            setSkillState(playerSkill, TEST_SKILL, { rank: RANK.NORMAL, level: 5 });

            playerSkill.skillLevelUp(TEST_SKILL, 'POINT');

            expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(5);
        });

        describe('POINT cost deduction by skill type', () => {
            it('deducts PointsEnum.SUB_SKILL for PASSIVE skills', () => {
                const getPoint = sinon
                    .stub()
                    .callsFake((point: PointsEnum) => (point === PointsEnum.SUB_SKILL ? 5 : 999999));
                const addPoint = sinon.stub();
                const player = createPlayer({ getPoint, addPoint });
                const skillProto = createSkillProto({
                    type: SkillTypeEnum.PASSIVE,
                    isPassive: sinon.stub().returns(true),
                });
                const skillManager = createSkillManager(skillProto);
                const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
                setSkillState(playerSkill, TEST_SKILL, { rank: RANK.NORMAL, level: 5 });

                playerSkill.skillLevelUp(TEST_SKILL, 'POINT');

                expect(addPoint.calledOnceWith(PointsEnum.SUB_SKILL, -1)).to.be.true;
                expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(6);
            });

            it('deducts PointsEnum.HORSE_SKILL for HORSE skills', () => {
                const getPoint = sinon
                    .stub()
                    .callsFake((point: PointsEnum) => (point === PointsEnum.HORSE_SKILL ? 5 : 999999));
                const addPoint = sinon.stub();
                const player = createPlayer({ getPoint, addPoint });
                const skillProto = createSkillProto({ type: SkillTypeEnum.HORSE });
                const skillManager = createSkillManager(skillProto);
                const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
                setSkillState(playerSkill, TEST_SKILL, { rank: RANK.NORMAL, level: 5 });

                playerSkill.skillLevelUp(TEST_SKILL, 'POINT');

                expect(addPoint.calledOnceWith(PointsEnum.HORSE_SKILL, -1)).to.be.true;
            });

            it('deducts PointsEnum.SKILL for ACTIVE skills', () => {
                const getPoint = sinon
                    .stub()
                    .callsFake((point: PointsEnum) => (point === PointsEnum.SKILL ? 5 : 999999));
                const addPoint = sinon.stub();
                const player = createPlayer({ getPoint, addPoint });
                const skillManager = createSkillManager(createSkillProto({ type: SkillTypeEnum.ACTIVE }));
                const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
                setSkillState(playerSkill, TEST_SKILL, { rank: RANK.NORMAL, level: 5 });

                playerSkill.skillLevelUp(TEST_SKILL, 'POINT');

                expect(addPoint.calledOnceWith(PointsEnum.SKILL, -1)).to.be.true;
            });

            it('does not level up when the player lacks the required skill point', () => {
                const getPoint = sinon
                    .stub()
                    .callsFake((point: PointsEnum) => (point === PointsEnum.SKILL ? 0 : 999999));
                const addPoint = sinon.stub();
                const player = createPlayer({ getPoint, addPoint });
                const skillManager = createSkillManager(createSkillProto());
                const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
                setSkillState(playerSkill, TEST_SKILL, { rank: RANK.NORMAL, level: 5 });

                playerSkill.skillLevelUp(TEST_SKILL, 'POINT');

                expect(addPoint.called).to.be.false;
                expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(5);
            });

            it('does not deduct skill points for BOOK method', () => {
                const addPoint = sinon.stub();
                const player = createPlayer({ addPoint });
                const skillManager = createSkillManager(createSkillProto());
                const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
                setSkillState(playerSkill, TEST_SKILL, { rank: RANK.MASTER, level: 25 });

                playerSkill.skillLevelUp(TEST_SKILL, 'BOOK');

                expect(addPoint.called).to.be.false;
            });
        });

        describe('automatic rank promotion (only for non-passive skills)', () => {
            it('does not run the rank-promotion switch for passive skills', () => {
                const skillProto = createSkillProto({
                    type: SkillTypeEnum.PASSIVE,
                    isPassive: sinon.stub().returns(true),
                });
                const player = createPlayer();
                const skillManager = createSkillManager(skillProto);
                const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
                setSkillState(playerSkill, TEST_SKILL, { rank: RANK.NORMAL, level: 16 });

                playerSkill.skillLevelUp(TEST_SKILL, 'POINT');

                expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(17);
                expect(playerSkill.getSkills()[TEST_SKILL].rank).to.equal(RANK.NORMAL);
            });

            it('jumps NORMAL rank to level 20 once level reaches 17 (random roll currently disabled)', () => {
                const player = createPlayer();
                const skillManager = createSkillManager(createSkillProto());
                const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
                setSkillState(playerSkill, TEST_SKILL, { rank: RANK.NORMAL, level: 16 });

                playerSkill.skillLevelUp(TEST_SKILL, 'POINT');

                expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(20);
                expect(playerSkill.getSkills()[TEST_SKILL].rank).to.equal(RANK.MASTER);
            });

            it('does not jump NORMAL rank when level stays below 17', () => {
                const player = createPlayer();
                const skillManager = createSkillManager(createSkillProto());
                const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
                setSkillState(playerSkill, TEST_SKILL, { rank: RANK.NORMAL, level: 10 });

                playerSkill.skillLevelUp(TEST_SKILL, 'POINT');

                expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(11);
                expect(playerSkill.getSkills()[TEST_SKILL].rank).to.equal(RANK.NORMAL);
            });

            it('promotes MASTER to GRAND_MASTER at level 30 when the random roll succeeds', () => {
                sandbox.stub(MathUtil, 'getRandomInt').returns(1);
                const player = createPlayer();
                const skillManager = createSkillManager(createSkillProto());
                const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
                setSkillState(playerSkill, TEST_SKILL, { rank: RANK.MASTER, level: 29 });

                playerSkill.skillLevelUp(TEST_SKILL, 'BOOK');

                expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(30);
                expect(playerSkill.getSkills()[TEST_SKILL].rank).to.equal(RANK.GRAND_MASTER);
            });

            it('does not promote MASTER to GRAND_MASTER when the random roll fails', () => {
                sandbox.stub(MathUtil, 'getRandomInt').returns(2);
                const player = createPlayer();
                const skillManager = createSkillManager(createSkillProto());
                const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
                setSkillState(playerSkill, TEST_SKILL, { rank: RANK.MASTER, level: 29 });

                playerSkill.skillLevelUp(TEST_SKILL, 'BOOK');

                expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(30);
                expect(playerSkill.getSkills()[TEST_SKILL].rank).to.equal(RANK.MASTER);
            });

            it('does not promote skill with book when is not a rank master skill', () => {
                const player = createPlayer();
                const skillManager = createSkillManager(createSkillProto());
                const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
                setSkillState(playerSkill, TEST_SKILL, { rank: RANK.GRAND_MASTER, level: 35 });

                playerSkill.skillLevelUp(TEST_SKILL, 'BOOK');

                expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(35);
                expect(playerSkill.getSkills()[TEST_SKILL].rank).to.equal(RANK.GRAND_MASTER);
            });
        });

        it('notifies the player (sendPoints/sendSkillLevel) after a successful level up', () => {
            const player = createPlayer();
            const skillManager = createSkillManager(createSkillProto());
            const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });
            setSkillState(playerSkill, TEST_SKILL, { rank: RANK.MASTER, level: 25 });

            playerSkill.skillLevelUp(TEST_SKILL, 'BOOK');

            expect((player.sendPoints as SinonStub).calledOnce).to.be.true;
            expect((player.sendSkillLevel as SinonStub).calledOnce).to.be.true;
        });
    });

    describe('isLearnableSkill', () => {
        it('returns false when the skill proto does not exist', () => {
            const playerSkill = new PlayerSkill({
                player: createPlayer(),
                skillManager: createSkillManager(undefined),
                skills: [],
            });

            expect(playerSkill.isLearnableSkill(TEST_SKILL)).to.be.false;
        });

        it('returns false when the skill is already at SKILL_MAX_LEVEL', () => {
            const skillManager = createSkillManager(createSkillProto());
            const playerSkill = new PlayerSkill({ player: createPlayer(), skillManager, skills: [] });
            setSkillState(playerSkill, TEST_SKILL, { level: SKILL_MAX_LEVEL });

            expect(playerSkill.isLearnableSkill(TEST_SKILL)).to.be.false;
        });

        it('returns false for passive skills at or above their own maxLevel', () => {
            const skillProto = createSkillProto({ maxLevel: 5, isPassive: sinon.stub().returns(true) });
            const skillManager = createSkillManager(skillProto);
            const playerSkill = new PlayerSkill({ player: createPlayer(), skillManager, skills: [] });
            setSkillState(playerSkill, TEST_SKILL, { level: 5 });

            expect(playerSkill.isLearnableSkill(TEST_SKILL)).to.be.false;
        });

        it('ignores skillProto.maxLevel for non-passive (active) skills', () => {
            const skillProto = createSkillProto({ maxLevel: 5, isPassive: sinon.stub().returns(false) });
            const skillManager = createSkillManager(skillProto);
            const playerSkill = new PlayerSkill({ player: createPlayer(), skillManager, skills: [] });
            setSkillState(playerSkill, TEST_SKILL, { level: 10 });

            expect(playerSkill.isLearnableSkill(TEST_SKILL)).to.be.true;
        });

        it('delegates to skillProto.canBeUsedBy(player) as the final check', () => {
            const canBeUsedBy = sinon.stub().returns(false);
            const skillProto = createSkillProto({ canBeUsedBy });
            const skillManager = createSkillManager(skillProto);
            const player = createPlayer();
            const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });

            expect(playerSkill.isLearnableSkill(TEST_SKILL)).to.be.false;
            expect(canBeUsedBy.calledOnceWith(player)).to.be.true;
        });
    });

    describe('learnSkillByBook', () => {
        function createHappyPathContext(
            overrides: {
                player?: Record<string, unknown>;
                skillProto?: Record<string, unknown>;
                skillState?: Partial<{ rank: number; level: number; timeToNextRead: number; readCount: number }>;
            } = {},
        ) {
            const skillProto = createSkillProto({ isPassive: sinon.stub().returns(false), ...overrides.skillProto });
            const player = createPlayer(overrides.player);
            const skillManager = createSkillManager(skillProto);
            const playerSkill = new PlayerSkill({ player, skillManager, skills: [] });

            setSkillState(playerSkill, TEST_SKILL, {
                rank: RANK.MASTER,
                level: 25,
                timeToNextRead: 0,
                readCount: 0,
                ...overrides.skillState,
            });
            sandbox.stub(Date, 'now').returns(NOW_SECONDS * 1000);

            return { player, skillProto, skillManager, playerSkill };
        }

        it('returns false without chatting when the skill proto does not exist', () => {
            const player = createPlayer();
            const playerSkill = new PlayerSkill({ player, skillManager: createSkillManager(undefined), skills: [] });

            const result = playerSkill.learnSkillByBook(TEST_SKILL, 50);

            expect(result).to.be.false;
            expect((player.chat as SinonStub).called).to.be.false;
        });

        it('returns false and chats when the skill is not learnable', () => {
            const player = createPlayer();
            const skillProto = createSkillProto({ canBeUsedBy: sinon.stub().returns(false) });
            const playerSkill = new PlayerSkill({ player, skillManager: createSkillManager(skillProto), skills: [] });

            const result = playerSkill.learnSkillByBook(TEST_SKILL, 50);

            expect(result).to.be.false;
            expect(
                (player.chat as SinonStub).calledOnceWith({
                    messageType: ChatMessageTypeEnum.NORMAL,
                    message: 'You cannot train this skill.',
                }),
            ).to.be.true;
        });

        it('returns false and chats when experience is below the required amount', () => {
            const getPoint = sinon
                .stub()
                .callsFake((point: PointsEnum) => (point === PointsEnum.EXPERIENCE ? 100 : 999999));
            const { player, playerSkill } = createHappyPathContext({ player: { getPoint } });

            const result = playerSkill.learnSkillByBook(TEST_SKILL, 50);

            expect(result).to.be.false;
            expect(
                (player.chat as SinonStub).calledOnceWith({
                    messageType: ChatMessageTypeEnum.NORMAL,
                    message: 'You cannot read this due to your lack of experience.',
                }),
            ).to.be.true;
        });

        it('returns false and chats when rank is above MASTER for a non-passive skill', () => {
            const { player, playerSkill } = createHappyPathContext({ skillState: { rank: RANK.GRAND_MASTER } });

            const result = playerSkill.learnSkillByBook(TEST_SKILL, 50);

            expect(result).to.be.false;
            expect(
                (player.chat as SinonStub).calledOnceWith({
                    messageType: ChatMessageTypeEnum.NORMAL,
                    message: 'You cannot train this skill with a Book.',
                }),
            ).to.be.true;
        });

        it('returns false and chats when rank is below MASTER for a non-passive skill', () => {
            const { player, playerSkill } = createHappyPathContext({ skillState: { rank: RANK.NORMAL } });

            const result = playerSkill.learnSkillByBook(TEST_SKILL, 50);

            expect(result).to.be.false;
            expect(
                (player.chat as SinonStub).calledOnceWith({
                    messageType: ChatMessageTypeEnum.NORMAL,
                    message: 'This skill level is not high enough to be trained with a Book.',
                }),
            ).to.be.true;
        });

        it('returns false and chats a wait message when timeToNextRead has not elapsed', () => {
            const { player, playerSkill } = createHappyPathContext({
                skillState: { timeToNextRead: NOW_SECONDS + 100 },
            });

            const result = playerSkill.learnSkillByBook(TEST_SKILL, 50);

            expect(result).to.be.false;

            expect(
                (player.chat as SinonStub).calledOnceWith({
                    messageType: ChatMessageTypeEnum.NORMAL,
                    message: 'I am burning inside, but it is calming down my body. My Chi has to stabilise.',
                }),
            ).to.be.true;
        });

        it('allows the read once the stored deadline has passed in wall-clock time', () => {
            const { player, playerSkill } = createHappyPathContext({
                skillState: { timeToNextRead: NOW_SECONDS - 1 },
            });
            sandbox.stub(MathUtil, 'getRandomInt').returns(10);

            const result = playerSkill.learnSkillByBook(TEST_SKILL, 50);

            expect(result).to.be.true;
            expect(
                (player.chat as SinonStub)
                    .getCalls()
                    .some((call) => String(call.args[0].message).includes('My Chi has to stabilise')),
            ).to.be.false;
        });

        it('picks the wait message from the remaining seconds, not milliseconds', () => {
            const { player, playerSkill } = createHappyPathContext({
                skillState: { timeToNextRead: NOW_SECONDS + 4 * 3600 },
            });

            playerSkill.learnSkillByBook(TEST_SKILL, 50);

            const messages = (player.chat as SinonStub).getCalls().map((call) => call.args[0].message);
            expect(messages).to.deep.equal([
                `Only a few more pages and then I'll have read everything.`,
                'I feel refreshed.',
            ]);
        });

        describe('probability !== 0 path', () => {
            it('levels up and sends the 3-message success sequence when the roll succeeds', () => {
                sandbox.stub(MathUtil, 'getRandomInt').returns(10);
                const { player, playerSkill } = createHappyPathContext();
                const skillLevelUpSpy = sandbox.spy(playerSkill, 'skillLevelUp');

                const result = playerSkill.learnSkillByBook(TEST_SKILL, 50);

                expect(result).to.be.true;
                expect(skillLevelUpSpy.calledOnceWith(TEST_SKILL, 'BOOK')).to.be.true;
                expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(26);

                const chat = player.chat as SinonStub;
                expect(chat.callCount).to.equal(3);
                expect(chat.getCall(0).args[0]).to.deep.equal({
                    messageType: ChatMessageTypeEnum.NORMAL,
                    message: 'My body is full of energy!',
                });
                expect(chat.getCall(1).args[0]).to.deep.equal({
                    messageType: ChatMessageTypeEnum.NORMAL,
                    message: 'The training seems to be working already...',
                });
                expect(chat.getCall(2).args[0]).to.deep.equal({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: 'You have successfully finished your training with the Book.',
                });
            });

            it('does not level up and sends the fail sequence when the roll fails', () => {
                sandbox.stub(MathUtil, 'getRandomInt').returns(90);
                const { player, playerSkill } = createHappyPathContext();
                const skillLevelUpSpy = sandbox.spy(playerSkill, 'skillLevelUp');

                const result = playerSkill.learnSkillByBook(TEST_SKILL, 50);

                expect(result).to.be.true;
                expect(skillLevelUpSpy.called).to.be.false;
                expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(25);

                const chat = player.chat as SinonStub;
                expect(chat.callCount).to.equal(2);
                expect(chat.getCall(0).args[0]).to.deep.equal({
                    messageType: ChatMessageTypeEnum.NORMAL,
                    message: 'That did not work. Damn!',
                });
                expect(chat.getCall(1).args[0]).to.deep.equal({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: 'Training has failed. Please try again later.',
                });
            });

            it('does not deduct experience in the probability path', () => {
                sandbox.stub(MathUtil, 'getRandomInt').returns(10);
                const addPoint = sinon.stub();
                const { playerSkill } = createHappyPathContext({ player: { addPoint } });

                playerSkill.learnSkillByBook(TEST_SKILL, 50);

                expect(addPoint.called).to.be.false;
            });
        });

        describe('probability === 0 path', () => {
            it('deducts 20000 experience unconditionally', () => {
                sandbox.stub(MathUtil, 'getRandomInt').returns(10);
                const addPoint = sinon.stub();
                const { playerSkill } = createHappyPathContext({ player: { addPoint } });

                playerSkill.learnSkillByBook(TEST_SKILL, 0);

                expect(addPoint.calledOnceWith(PointsEnum.EXPERIENCE, -20000)).to.be.true;
            });

            it('completes the training with a single success message when readCount >= neededCount', () => {
                const getRandomInt = sinon.stub();
                getRandomInt.onCall(0).returns(80);
                sandbox.stub(MathUtil, 'getRandomInt').callsFake(getRandomInt);

                const { player, playerSkill } = createHappyPathContext({ skillState: { readCount: 5 } });
                const skillLevelUpSpy = sandbox.spy(playerSkill, 'skillLevelUp');

                const result = playerSkill.learnSkillByBook(TEST_SKILL, 0);

                expect(result).to.be.true;
                expect(skillLevelUpSpy.calledOnceWith(TEST_SKILL, 'BOOK')).to.be.true;
                expect(playerSkill.getSkills()[TEST_SKILL].readCount).to.equal(0);

                const chat = player.chat as SinonStub;
                expect(
                    chat.calledOnceWith({
                        messageType: ChatMessageTypeEnum.INFO,
                        message: 'You have successfully finished your training with the Book.',
                    }),
                ).to.be.true;
            });

            it('increments readCount and sends a progress message when readCount < neededCount', () => {
                const getRandomInt = sinon.stub();
                getRandomInt.onCall(0).returns(80);
                getRandomInt.onCall(1).returns(2);
                sandbox.stub(MathUtil, 'getRandomInt').callsFake(getRandomInt);

                const { player, playerSkill } = createHappyPathContext({ skillState: { readCount: 1 } });
                const skillLevelUpSpy = sandbox.spy(playerSkill, 'skillLevelUp');

                const result = playerSkill.learnSkillByBook(TEST_SKILL, 0);

                expect(result).to.be.true;
                expect(skillLevelUpSpy.called).to.be.false;
                expect(playerSkill.getSkills()[TEST_SKILL].readCount).to.equal(2);
                expect(
                    (player.chat as SinonStub).calledOnceWith({
                        messageType: ChatMessageTypeEnum.NORMAL,
                        message: 'These instructions are difficult to understand. I have to carry on studying.',
                    }),
                ).to.be.true;
            });

            it('falls through to the fail sequence when the roll does not exceed percent', () => {
                sandbox.stub(MathUtil, 'getRandomInt').returns(50);
                const { player, playerSkill } = createHappyPathContext();

                const result = playerSkill.learnSkillByBook(TEST_SKILL, 0);

                expect(result).to.be.true;
                expect(playerSkill.getSkills()[TEST_SKILL].level).to.equal(25);

                const chat = player.chat as SinonStub;
                expect(chat.callCount).to.equal(2);
                expect(chat.getCall(0).args[0].message).to.equal('That did not work. Damn!');
                expect(chat.getCall(1).args[0].message).to.equal('Training has failed. Please try again later.');
            });
        });
    });

    describe('clearSkill', () => {
        function createPlayerWithSkillPool(level: number, initialPool: number) {
            const pool = { value: initialPool };
            const player = createPlayer({
                getPoint: sinon.stub().callsFake((point: PointsEnum) => {
                    if (point === PointsEnum.LEVEL) return level;
                    if (point === PointsEnum.SKILL) return pool.value;
                    return 0;
                }),
                addPoint: sinon.stub().callsFake((point: PointsEnum, value: number) => {
                    if (point === PointsEnum.SKILL) pool.value = Math.max(0, pool.value + value);
                }),
                setPoint: sinon.stub().callsFake((point: PointsEnum, value: number) => {
                    if (point === PointsEnum.SKILL) pool.value = value;
                }),
            });
            return { player, pool };
        }

        it('leaves the player with level - 1 points, keeping the ones already unspent', () => {
            const { player, pool } = createPlayerWithSkillPool(30, 12);
            const playerSkill = new PlayerSkill({ player, skillManager: createSkillManager(undefined), skills: [] });

            playerSkill.clearSkill();

            expect(pool.value).to.equal(29);
        });

        it('does not consume the pool of a player who never spent a point', () => {
            const { player, pool } = createPlayerWithSkillPool(30, 29);
            const playerSkill = new PlayerSkill({ player, skillManager: createSkillManager(undefined), skills: [] });

            playerSkill.clearSkill();

            expect(pool.value).to.equal(29);
        });

        it('recalculates the SKILL point pool and resets every skill slot', () => {
            const getPoint = sinon.stub().callsFake((point: PointsEnum) => {
                if (point === PointsEnum.LEVEL) return 30;
                if (point === PointsEnum.SKILL) return 3;
                return 0;
            });
            const addPoint = sinon.stub();
            const player = createPlayer({ getPoint, addPoint });
            const playerSkill = new PlayerSkill({ player, skillManager: createSkillManager(undefined), skills: [] });

            setSkillState(playerSkill, TEST_SKILL, { rank: RANK.MASTER, level: 25, readCount: 4, timeToNextRead: 555 });

            playerSkill.clearSkill();

            expect(addPoint.calledOnceWith(PointsEnum.SKILL, 26)).to.be.true;
            expect(playerSkill.getSkills()[TEST_SKILL]).to.deep.equal({
                rank: RANK.NORMAL,
                level: 0,
                timeToNextRead: 0,
                readCount: 0,
            });
            expect((player.sendPoints as SinonStub).called).to.be.true;
            expect((player.sendSkillLevel as SinonStub).called).to.be.true;
        });

        it('resets all 255 slots, not just the ones touched previously', () => {
            const player = createPlayer();
            const playerSkill = new PlayerSkill({ player, skillManager: createSkillManager(undefined), skills: [] });

            setSkillState(playerSkill, TEST_SKILL, { level: 10 });
            setSkillState(playerSkill, SkillEnum.DASH, { level: 5, rank: RANK.MASTER });

            playerSkill.clearSkill();

            expect(playerSkill.getSkills().every((s) => s.level === 0 && s.rank === RANK.NORMAL)).to.be.true;
        });
    });

    describe('hasSkillGroup', () => {
        it('returns true when getSkillGroup() > 0', () => {
            const player = createPlayer({ getSkillGroup: sinon.stub().returns(1) });
            const playerSkill = new PlayerSkill({ player, skillManager: createSkillManager(undefined), skills: [] });

            expect(playerSkill.hasSkillGroup()).to.be.true;
        });

        it('returns false when getSkillGroup() is 0', () => {
            const player = createPlayer({ getSkillGroup: sinon.stub().returns(0) });
            const playerSkill = new PlayerSkill({ player, skillManager: createSkillManager(undefined), skills: [] });

            expect(playerSkill.hasSkillGroup()).to.be.false;
        });
    });

    describe('calculateCooltime', () => {
        it('delegates to MathUtil.calcDuration using the player casting speed', () => {
            const getPoint = sinon
                .stub()
                .callsFake((point: PointsEnum) => (point === PointsEnum.CASTING_SPEED ? 42 : 0));
            const player = createPlayer({ getPoint });
            const calcDuration = sandbox.stub(MathUtil, 'calcDuration').returns(7);
            const playerSkill = new PlayerSkill({ player, skillManager: createSkillManager(undefined), skills: [] });

            const result = playerSkill.calculateCooltime(100);

            expect(calcDuration.calledOnceWith(42, 100)).to.be.true;
            expect(result).to.equal(7);
        });
    });

    describe('setSkillNextReadTime', () => {
        it('sets timeToNextRead for the given skill', () => {
            const playerSkill = new PlayerSkill({
                player: createPlayer(),
                skillManager: createSkillManager(undefined),
                skills: [],
            });

            playerSkill.setSkillNextReadTime(TEST_SKILL, 123456);

            expect(playerSkill.getSkills()[TEST_SKILL].timeToNextRead).to.equal(123456);
        });
    });

    describe('getNeedToWaitMoreTimeMessages', () => {
        let playerSkill: PlayerSkill;

        beforeEach(() => {
            playerSkill = new PlayerSkill({
                player: createPlayer(),
                skillManager: createSkillManager(undefined),
                skills: [],
            });
        });

        const cases: Array<{ time: number; expected: string[] }> = [
            { time: 100, expected: ['I am burning inside, but it is calming down my body. My Chi has to stabilise.'] },
            { time: 200, expected: ['A little slow, but steady... Without stopping!'] },
            { time: 400, expected: ['Yes, that feels great. My body is full of Chi.'] },
            {
                time: 1000,
                expected: ['I have read it! Now the Chi will spread through my body.', 'The training is completed.'],
            },
            { time: 2000, expected: ['I am on the last page of the book. The training is nearly finished!'] },
            { time: 5000, expected: ['Nearly finished! Just a little bit more to go!'] },
            { time: 8000, expected: ['Eureka! I have nearly finished reading it!'] },
            {
                time: 15000,
                expected: [`Only a few more pages and then I'll have read everything.`, 'I feel refreshed.'],
            },
            { time: 30000, expected: ['Now I understand it!', 'Okay I have to stay concentrated!'] },
            {
                time: 50000,
                expected: ['I keep reading the same line over and over again.', 'I do not want to learn any more.'],
            },
            {
                time: 70000,
                expected: [
                    'It is a lot more complicated and more difficult to understand than I thought.',
                    `It's hard for me to concentrate.I should take a break.`,
                ],
            },
        ];

        cases.forEach(({ time, expected }) => {
            it(`returns the correct message(s) for time=${time}`, () => {
                expect(playerSkill.getNeedToWaitMoreTimeMessages(time)).to.deep.equal(expected);
            });
        });
    });
});
