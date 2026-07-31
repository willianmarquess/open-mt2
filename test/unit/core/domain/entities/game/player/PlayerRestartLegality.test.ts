import { expect } from 'chai';
import { PlayerFactory } from '@/core/domain/factories/PlayerFactory';
import Player from '@/core/domain/entities/game/player/Player';
import Character from '@/core/domain/entities/game/Character';

const logger: any = { info: () => {}, error: () => {}, debug: () => {} };

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

const createConnection = () => {
    const commands: string[] = [];
    const states: number[] = [];
    return {
        commands,
        states,
        connection: {
            send: (packet: any) => {
                const message = (packet as any).message;
                if (typeof message === 'string') commands.push(message);
            },
            setState: (state: number) => states.push(state),
        } as any,
    };
};

const createArea = () => {
    const spawned: any[] = [];
    return {
        spawned,
        spawn: (entity: any) => spawned.push(entity),
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

describe('Player restart legality', () => {
    describe('while alive', () => {
        it('should refuse /restart_town instead of warping the character', () => {
            const player = createPlayer();
            const area = createArea();
            const { connection, states } = createConnection();
            player.setConnection(connection);
            player.setArea(area as any);

            expect(player.isDead()).to.equal(false);

            player.restart('TOWN');

            expect(player.getPositionX(), 'the character did not warp').to.equal(50_000);
            expect(player.getPositionY(), 'the character did not warp').to.equal(60_000);
            expect(area.spawned, 'no respawn was queued').to.have.lengthOf(0);
            expect(states, 'the connection state was left alone').to.have.lengthOf(0);
        });

        it('should refuse /restart_here instead of respawning the character', () => {
            const player = createPlayer();
            const area = createArea();
            const { connection } = createConnection();
            player.setConnection(connection);
            player.setArea(area as any);

            player.restart('HERE');

            expect(area.spawned).to.have.lengthOf(0);
        });

        it('should still close the restart window, like the original does', () => {
            const player = createPlayer();
            const { connection, commands } = createConnection();
            player.setConnection(connection);
            player.setArea(createArea() as any);

            player.restart('HERE');

            expect(commands).to.include('CloseRestartWindow');
        });
    });

    describe('while dead', () => {
        it('should still warp on /restart_town', () => {
            const player = createPlayer();
            const area = createArea();
            const { connection } = createConnection();
            player.setConnection(connection);
            player.setArea(area as any);
            player.die(createKiller());

            player.restart('TOWN');

            expect(player.getPositionX()).to.equal(START_X);
            expect(player.getPositionY()).to.equal(START_Y);
            expect(area.spawned).to.have.lengthOf(1);
        });

        it('should still respawn on /restart_here', () => {
            const player = createPlayer();
            const area = createArea();
            const { connection } = createConnection();
            player.setConnection(connection);
            player.setArea(area as any);
            player.die(createKiller());

            player.restart('HERE');

            expect(area.spawned).to.have.lengthOf(1);
        });
    });
});
