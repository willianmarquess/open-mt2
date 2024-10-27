import { expect } from 'chai';
import sinon from 'sinon';
import PlayerFactory from '../../../../../src/core/domain/factories/PlayerFactory.js';
import JobUtil from '../../../../../src/core/domain/util/JobUtil.js';
import EmpireUtil from '../../../../../src/core/domain/util/EmpireUtil.js';
import Player from '../../../../../src/core/domain/entities/game/player/Player.js';

describe('PlayerFactory', () => {
    let config;
    let animationManager;
    let playerFactory;
    sinon.stub(JobUtil, 'getClassNameFromClassId').returns('ClassName');
    sinon.stub(EmpireUtil, 'getEmpireName').returns('EmpireName');

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
        playerFactory = new PlayerFactory({ config, animationManager });
    });

    it('should create a player with default values', () => {
        const params = {
            playerClass: 1,
            accountId: 'accountId',
            appearance: 'appearance',
            slot: 1,
            virtualId: 'virtualId',
            id: 'id',
            empire: 1,
            skillGroup: 'skillGroup',
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
            bodyPart: 'bodyPart',
            hairPart: 'hairPart',
            name: 'name',
            givenStatusPoints: 0,
            availableStatusPoints: 0,
        };

        const player = playerFactory.create(params);

        expect(player).to.be.an.instanceof(Player);

        expect(player.accountId).to.be.equal('accountId');
        expect(player.name).to.be.equal('name');
        expect(player.empire).to.be.equal(1);
        expect(player.playerClass).to.be.equal(1);
        expect(player.appearance).to.be.equal('appearance');
        expect(player.slot).to.be.equal(1);
        expect(player.positionX).to.be.equal(300);
        expect(player.positionY).to.be.equal(400);
        expect(player.st).to.be.equal(10);
        expect(player.ht).to.be.equal(10);
        expect(player.dx).to.be.equal(10);
        expect(player.iq).to.be.equal(10);
        expect(player.health).to.be.equal(130);
        expect(player.mana).to.be.equal(65);
        expect(player.stamina).to.be.equal(50);
        expect(player.virtualId).to.be.equal('virtualId');
        expect(player.bodyPart).to.be.equal('bodyPart');
        expect(player.hairPart).to.be.equal('hairPart');
        expect(player.givenStatusPoints).to.be.equal(0);
        expect(player.availableStatusPoints).to.be.equal(0);
        expect(player.id).to.be.equal('id');
        expect(player.skillGroup).to.be.equal('skillGroup');
        expect(player.playTime).to.be.equal(1000);
        expect(player.level).to.be.equal(1);
        expect(player.experience).to.be.equal(0);
        expect(player.gold).to.be.equal(100);
    });

    it('should create a player with config default values when params are missing', () => {
        const params = {
            playerClass: 1,
            accountId: 'accountId',
            appearance: 'appearance',
            slot: 1,
            virtualId: 'virtualId',
            id: 'id',
            empire: 1,
            skillGroup: 'skillGroup',
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
            accountId: 'accountId',
            name: 'name',
            empire: 1,
            playerClass: 1,
            appearance: 'appearance',
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
            virtualId: 'virtualId',
            bodyPart: 0,
            hairPart: 0,
            givenStatusPoints: 0,
            availableStatusPoints: 0,
            id: 'id',
            skillGroup: 'skillGroup',
            playTime: 1000,
            level: 1,
            experience: 0,
            gold: 100,
        });
    });
});
