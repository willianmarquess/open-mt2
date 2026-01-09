import Player from '@/core/domain/entities/game/player/Player';
import PlayerFactory from '@/core/domain/factories/PlayerFactory';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { expect } from 'chai';

describe('PlayerFactory', () => {
    let config;
    let animationManager;
    let playerFactory: PlayerFactory;
    let experienceManager;
    let logger;
    let saveCharacterService;

    beforeEach(() => {
        config = {
            empire: {
                red: {
                    startPosX: 100,
                    startPosY: 200,
                },
            },
            jobs: {
                assassin: {
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
                        initialAttackSpeed: 1.0,
                        initialMovementSpeed: 1.0,
                    },
                },
            },
        };
        experienceManager = {
            getNeededExperience: () => 100,
        };
        animationManager = {};
        playerFactory = new PlayerFactory({
            config,
            animationManager,
            experienceManager,
            logger,
            saveCharacterService,
        });
    });

    it('should create a player with default values', () => {
        const params = {
            playerClass: 1,
            accountId: 1,
            appearance: 1,
            slot: 1,
            virtualId: 1,
            id: 1,
            empire: 1,
            skillGroup: 1,
            playTime: 1000,
            level: 1,
            experience: 0,
            gold: 100,
            st: 10,
            ht: 10,
            dx: 10,
            iq: 10,
            positionX: 300,
            positionY: 400,
            health: 200,
            mana: 100,
            stamina: 50,
            bodyPart: 1,
            hairPart: 1,
            name: 'name',
            givenStatusPoints: 0,
            availableStatusPoints: 0,
        };

        const player = playerFactory.create(params);

        expect(player).to.be.an.instanceof(Player);

        expect(player.getAccountId()).to.be.equal(1);
        expect(player.getName()).to.be.equal('name');
        expect(player.getEmpire()).to.be.equal(1);
        expect(player.getPlayerClass()).to.be.equal(1);
        expect(player.getAppearance()).to.be.equal(1);
        expect(player.getSlot()).to.be.equal(1);
        expect(player.getPositionX()).to.be.equal(300);
        expect(player.getPositionY()).to.be.equal(400);
        expect(player.getPoint(PointsEnum.ST)).to.be.equal(10);
        expect(player.getPoint(PointsEnum.HT)).to.be.equal(10);
        expect(player.getPoint(PointsEnum.DX)).to.be.equal(10);
        expect(player.getPoint(PointsEnum.IQ)).to.be.equal(10);
        expect(player.getPoint(PointsEnum.HEALTH)).to.be.equal(200);
        expect(player.getPoint(PointsEnum.MANA)).to.be.equal(100);
        expect(player.getPoint(PointsEnum.STAMINA)).to.be.equal(50);
        expect(player.getVirtualId()).to.be.equal(1);
        expect(player.getBodyPart()).to.be.equal(1);
        expect(player.getHairPart()).to.be.equal(1);
        expect(player.getId()).to.be.equal(1);
        expect(player.getSkillGroup()).to.be.equal(1);
        expect(player.getPoint(PointsEnum.PLAY_TIME)).to.be.equal(1000);
        expect(player.getLevel()).to.be.equal(1);
        expect(player.getPoint(PointsEnum.EXPERIENCE)).to.be.equal(0);
        expect(player.getPoint(PointsEnum.GOLD)).to.be.equal(100);
    });

    it('should create a player with config default values when params are missing', () => {
        const params = {
            playerClass: 1,
            accountId: 1,
            appearance: 1,
            slot: 1,
            virtualId: 1,
            id: 1,
            empire: 1,
            skillGroup: 1,
            playTime: 1000,
            level: 1,
            experience: 0,
            gold: 100,
            name: 'name',
            givenStatusPoints: 0,
            availableStatusPoints: 0,
        };

        const player = playerFactory.create(params);

        expect(player).to.be.an.instanceof(Player);
    });
});
