import { expect } from 'chai';
import { PlayerFactory } from '@/core/domain/factories/PlayerFactory';
import Player from '@/core/domain/entities/game/player/Player';
import { SkillEnum } from '@/core/enum/SkillEnum';
import { HORSE_MAX_LEVEL } from '@/core/domain/entities/game/horse/HorseStats';

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
                initialHp: 100,
                initialMp: 50,
                initialStamina: 30,
                hpPerLvl: 10,
                hpPerHtPoint: 2,
                mpPerLvl: 5,
                mpPerIqPoint: 1,
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

const createFactoryDeps = () => ({
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
    } as any,
    mobManager: { getMobProto: () => undefined } as any,
});

const SKILL_ENTRY_SIZE = 6;
const HEADER_SIZE = 1;

const createConnection = () => {
    const sentPackets: Array<{ name: string; buffer: Buffer }> = [];
    return {
        sentPackets,
        connection: {
            send: (packet: any) => {
                sentPackets.push({ name: packet.constructor.name, buffer: packet.pack() });
            },
            setState: () => {},
        } as any,
    };
};

const createPlayer = (connection: any): Player => {
    const player = PlayerFactory.create(
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
            level: 60,
            experience: 0,
            gold: 0,
            name: 'Rider',
            givenStatusPoints: 0,
            availableStatusPoints: 0,
            horseLevel: 11,
            horseHealth: 100,
            horseStamina: 100,
            horseName: 'Pony',
        } as any,
        createFactoryDeps(),
    );
    player.setConnection(connection);
    return player;
};

const readSkillLevelFromPacket = (buffer: Buffer, skillNum: number) =>
    buffer.readUInt8(HEADER_SIZE + skillNum * SKILL_ENTRY_SIZE + 1);

const storedRidingLevel = (player: Player) => (player.toDatabase() as any).skills[SkillEnum.HORSE].level;

describe('Player.setHorseLevel skill slot (issue #205)', () => {
    it('stores the clamped horse level in the riding skill slot', () => {
        const { connection } = createConnection();
        const player = createPlayer(connection);

        player.setHorseLevel(-1);

        expect(storedRidingLevel(player)).to.equal(0);
        expect(player.getHorseLevel()).to.equal(0);
    });

    it('keeps the riding slot and the horse level in agreement above the cap', () => {
        const { connection } = createConnection();
        const player = createPlayer(connection);

        player.setHorseLevel(99);

        expect(storedRidingLevel(player)).to.equal(HORSE_MAX_LEVEL);
        expect(player.getHorseLevel()).to.equal(HORSE_MAX_LEVEL);
    });

    it('sends the skill levels so the client does not keep the old riding level', () => {
        const { sentPackets, connection } = createConnection();
        const player = createPlayer(connection);
        sentPackets.length = 0;

        player.setHorseLevel(12);

        const skillPacket = sentPackets.find((packet) => packet.name === 'SkillLevelPacket');
        expect(skillPacket, 'setHorseLevel must resend the skill levels').to.not.be.undefined;
        expect(readSkillLevelFromPacket(skillPacket.buffer, SkillEnum.HORSE)).to.equal(12);
    });
});
