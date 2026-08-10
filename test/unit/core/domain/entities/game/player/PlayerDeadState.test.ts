import { expect } from 'chai';
import { PlayerFactory } from '@/core/domain/factories/PlayerFactory';
import Player from '@/core/domain/entities/game/player/Player';
import Character from '@/core/domain/entities/game/Character';
import Monster from '@/core/domain/entities/game/mob/Monster';
import { PositionEnum } from '@/core/enum/PositionEnum';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';

const logger: any = { info: () => {}, error: () => {}, debug: () => {} };

const config: any = {
    empire: { red: { startPosX: 100, startPosY: 200 } },
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

const createPlayer = (virtualId: number, name: string): Player =>
    PlayerFactory.create(
        {
            playerClass: 0,
            accountId: virtualId,
            appearance: 0,
            slot: 0,
            virtualId,
            id: virtualId,
            empire: 1,
            skillGroup: 0,
            playTime: 0,
            level: 25,
            experience: 0,
            gold: 0,
            name,
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
            skillManager: { getSkillProto: () => undefined } as any,
        },
    );

const createConnection = () =>
    ({
        send: () => {},
        setState: () => {},
    }) as any;

const createKiller = (virtualId: number) =>
    ({
        getVirtualId: () => virtualId,
        getName: () => 'Killer',
        removeTargetedBy: () => {},
        addTargetedBy: () => {},
    }) as unknown as Character;

// A live victim: attack() must reach neither the cooldown nor the battle
// delegate while the attacker is dead, so only the isDead/getVirtualId surface
// is exercised on the fixed path.
const createVictim = (virtualId: number) =>
    ({
        isDead: () => false,
        getVirtualId: () => virtualId,
        getPositionX: () => 0,
        getPositionY: () => 0,
        wasAttackedRecentlyBy: () => false,
        recordAttackedBy: () => {},
    }) as unknown as Monster;

const kill = (player: Player) => {
    player.die(createKiller(999));
    expect(player.isDead(), 'setup: the character is dead').to.equal(true);
};

describe('Player dead state legality', () => {
    describe('restart', () => {
        it('should clear the dead position on /restart_here', () => {
            const player = createPlayer(1, 'Restarter');
            player.setConnection(createConnection());
            kill(player);

            player.restart('HERE');

            expect(player.isDead()).to.equal(false);
            expect(player.getPos()).to.equal(PositionEnum.STANDING);
        });

        it('should clear the dead position on /restart_town', () => {
            const player = createPlayer(1, 'Restarter');
            player.setConnection(createConnection());
            kill(player);

            player.restart('TOWN');

            expect(player.isDead()).to.equal(false);
            expect(player.getPos()).to.equal(PositionEnum.STANDING);
        });
    });

    describe('attack', () => {
        it('should ignore an attack sent while dead instead of reviving the attacker', () => {
            const player = createPlayer(1, 'Swinger');
            player.setConnection(createConnection());
            kill(player);

            player.attack(AttackTypeEnum.NORMAL, createVictim(77));

            expect(player.isDead(), 'the attack did not revive the attacker').to.equal(true);
            expect(player.getPos()).to.equal(PositionEnum.DEAD);
        });

        it('should still let a living character attack', () => {
            const player = createPlayer(1, 'Swinger');
            player.setConnection(createConnection());

            expect(player.isDead()).to.equal(false);

            player.attack(AttackTypeEnum.NORMAL, createVictim(77));

            expect(player.getPos()).to.equal(PositionEnum.FIGHTING);
        });
    });
});
