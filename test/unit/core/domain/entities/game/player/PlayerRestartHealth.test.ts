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

// A timer manager that actually tracks which ids are armed per owner, so a
// test can tell whether death cleared the regen timers and whether a restart
// brought them back.
const createTimerManager = () => {
    const active = new Map<number, Set<string>>();
    const ids = (ownerId: number) => active.get(ownerId) ?? new Set<string>();
    return {
        active,
        addTimer: ({ id, ownerId }: { id: string; ownerId: number }) => {
            if (!active.has(ownerId)) active.set(ownerId, new Set());
            active.get(ownerId)!.add(id);
        },
        removeTimer: () => {},
        isTimerActive: (ownerId: number, id: string) => ids(ownerId).has(id),
        clearTimersByOwner: (ownerId: number) => active.delete(ownerId),
        removeAllTimersFromOwner: (ownerId: number) => active.delete(ownerId),
    };
};

const createPlayer = (timerManager: any = createTimerManager()): Player =>
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
            eventTimerManager: timerManager as any,
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
    const timers = createTimerManager();
    const player = createPlayer(timers);
    const area = createArea();
    player.setConnection({ send: () => {}, setState: () => {} } as any);
    player.setArea(area as any);
    player.die(createKiller());
    return { player, area, timers };
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

    it('should re-arm the health and mana regeneration that death cleared', () => {
        const { player, timers } = createDeadPlayer();
        const vid = player.getVirtualId();

        // Death clears every timer, so regeneration is off at this point — that
        // is exactly what a naive restart would leave in place.
        expect(timers.isTimerActive(vid, 'REGEN_HEALTH'), 'death cleared regen').to.equal(false);

        player.restart('HERE');

        expect(timers.isTimerActive(vid, 'REGEN_HEALTH')).to.equal(true);
        expect(timers.isTimerActive(vid, 'REGEN_MANA')).to.equal(true);
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
