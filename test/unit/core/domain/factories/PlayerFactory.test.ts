import Player from '@/core/domain/entities/game/player/Player';
import PlayerFactory from '@/core/domain/factories/PlayerFactory';
import { expect } from 'chai';

describe('PlayerFactory', () => {
    let config;
    let animationManager;
    let playerFactory: PlayerFactory;
    let experienceManager;
    let logger;

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
        animationManager = {};
        playerFactory = new PlayerFactory({
            config,
            animationManager,
            experienceManager,
            logger,
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
        expect(player.getSt()).to.be.equal(10);
        expect(player.getHt()).to.be.equal(10);
        expect(player.getDx()).to.be.equal(10);
        expect(player.getIq()).to.be.equal(10);
        expect(player.getHealth()).to.be.equal(130);
        expect(player.getMana()).to.be.equal(65);
        expect(player.getStamina()).to.be.equal(50);
        expect(player.getVirtualId()).to.be.equal(1);
        expect(player.getBodyPart()).to.be.equal(1);
        expect(player.getHairPart()).to.be.equal(1);
        expect(player.getGivenStatusPoints()).to.be.equal(0);
        expect(player.getAvailableStatusPoints()).to.be.equal(0);
        expect(player.getId()).to.be.equal(1);
        expect(player.getSkillGroup()).to.be.equal(1);
        expect(player.getPlayTime()).to.be.equal(1000);
        expect(player.getLevel()).to.be.equal(1);
        expect(player.getExperience()).to.be.equal(0);
        expect(player.getGold()).to.be.equal(100);
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

        expect(player).to.include({
            accountId: 1,
            name: 'name',
            empire: 1,
            playerClass: 1,
            appearance: 1,
            slot: 1,
            positionX: 100,
            positionY: 200,
            st: 10,
            ht: 10,
            dx: 10,
            iq: 10,
            health: 130,
            mana: 65,
            stamina: 30,
            virtualId: 1,
            bodyPart: 0,
            hairPart: 0,
            givenStatusPoints: 0,
            availableStatusPoints: 0,
            id: 1,
            skillGroup: 1,
            playTime: 1000,
            level: 1,
            experience: 0,
            gold: 100,
        });
    });
});
