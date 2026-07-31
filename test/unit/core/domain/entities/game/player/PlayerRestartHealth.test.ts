import { expect } from 'chai';
import { PlayerFactory } from '@/core/domain/factories/PlayerFactory';
import Player from '@/core/domain/entities/game/player/Player';
import Character from '@/core/domain/entities/game/Character';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';

const logger: any = { info: () => {}, error: () => {}, debug: () => {} };

const RESTART_HEALTH = 50;
const START_X = 100;
const START_Y = 200;

const config: any = {
    empire: { red: { startPosX: START_X, startPosY: START_Y } },
    jobs: {
        warrior: {
            common: {
                st: 10,
                ht: 10,
                dx: 10,
                iq: 10,
                initialHp: 1000,
                initialMp: 50,
                initialStamina: 30,
                hpPerLvl: 0,
                hpPerHtPoint: 0,
                mpPerLvl: 0,
                mpPerIqPoint: 0,
                initialAttackSpeed: 100,
                initialMovementSpeed: 100,
                defensePerHtPoint: 1,
                attackPerDXPoint: 1,
                attackPerIQPoint: 1,
                attackPerStPoint: 1,
            },
        },
    },
};

const createPlayer = (): Player =>
    PlayerFactory.create(
        {
            playerClass: 0,
            accountId: 1,
            appearance: 0,
            slot: 0,
            virtualId: 1,
            id: 1,
            empire: 1,
            skillGroup: 0,
            playTime: 0,
            level: 25,
            experience: 0,
            gold: 0,
            positionX: 50_000,
            positionY: 60_000,
            name: 'Restarter',
            givenStatusPoints: 0,
            availableStatusPoints: 0,
        } as any,
        {
            config,
            animationManager: { getAnimation: () => undefined } as any,
            experienceManager: { getNeededExperience: () => 1000 } as any,
            logger,
            saveCharacterService: { execute: async () => {} } as any,
            questManager: { getQuestsByEvent: () => [], onKill: () => {} } as any,
            eventTimerManager: {
                addTimer: () => {},
                removeTimer: () => {},
                isTimerActive: () => false,
                clearTimersByOwner: () => {},
                removeAllTimersFromOwner: () => {},
            } as any,
            mobManager: { getMobProto: () => undefined } as any,
        },
    );

const createArea = () => {
    const spawned: any[] = [];
    const moves: any[] = [];
    return {
        spawned,
        moves,
        spawn: (entity: any) => spawned.push(entity),
        onCharacterMove: (event: any) => moves.push(event),
        getStartPositionByEmpire: () => ({ x: START_X, y: START_Y }),
    };
};

const createKiller = () =>
    ({
        getVirtualId: () => 999,
        getName: () => 'Killer',
        removeTargetedBy: () => {},
        addTargetedBy: () => {},
    }) as unknown as Character;

const createDeadPlayer = () => {
    const player = createPlayer();
    const area = createArea();
    player.setConnection({ send: () => {}, setState: () => {} } as any);
    player.setArea(area as any);
    player.die(createKiller());
    return { player, area };
};

describe('Player restart health', () => {
    it('should leave the character on the flat restart health, not a full bar', () => {
        const { player } = createDeadPlayer();
        const maxHealth = player.getPoint(PointsEnum.MAX_HEALTH);

        player.restart('HERE');

        expect(maxHealth, 'setup: the full bar is far above the restart value').to.be.greaterThan(RESTART_HEALTH * 4);
        expect(player.getPoint(PointsEnum.HEALTH)).to.equal(RESTART_HEALTH);
    });

    it('should use the same flat health when restarting in town', () => {
        const { player } = createDeadPlayer();

        player.restart('TOWN');

        expect(player.getPoint(PointsEnum.HEALTH)).to.equal(RESTART_HEALTH);
    });

    it('should not queue another spawn, so onSpawn cannot re-initialise the character', () => {
        const { player, area } = createDeadPlayer();

        player.restart('HERE');

        expect(area.spawned).to.have.lengthOf(0);
    });

    it('should move through the normal movement path when restarting in town', () => {
        const { player, area } = createDeadPlayer();

        player.restart('TOWN');

        expect(player.getPositionX()).to.equal(START_X);
        expect(player.getPositionY()).to.equal(START_Y);
        // Going through wait() is what keeps the spatial grid and the nearby
        // entity lists consistent after the jump across the map.
        expect(area.moves, 'the warp went through the area movement path').to.have.lengthOf(1);
    });

    it('should grant the revive invisibility when restarting in place', () => {
        const { player } = createDeadPlayer();

        player.restart('HERE');

        expect(player.isAffectByFlag(AffectBitsTypeEnum.REVIVE_INVISIBLE)).to.equal(true);
    });

    it('should not grant the revive invisibility when restarting in town', () => {
        const { player } = createDeadPlayer();

        player.restart('TOWN');

        expect(player.isAffectByFlag(AffectBitsTypeEnum.REVIVE_INVISIBLE)).to.equal(false);
    });
});
