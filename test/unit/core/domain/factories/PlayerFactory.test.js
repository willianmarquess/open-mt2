import { expect } from 'chai';
import sinon from 'sinon';
import PlayerFactory from '../../../../../src/core/domain/factories/PlayerFactory.js';
import Player from '../../../../../src/core/domain/entities/player/Player.js';
import JobUtil from '../../../../../src/core/domain/util/JobUtil.js';
import EmpireUtil from '../../../../../src/core/domain/util/EmpireUtil.js';

describe('PlayerFactory', () => {
    let config;
    let animationManager;
    let playerFactory;

    beforeEach(() => {
        config = {
            empire: {
                EmpireName: {
                    startPosX: 100,
                    startPosY: 200,
                },
            },
            jobs: {
                ClassName: {
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
            updatedAt: new Date(),
            createdAt: new Date(),
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

        sinon.stub(JobUtil, 'getClassNameFromClassId').returns('ClassName');
        sinon.stub(EmpireUtil, 'getEmpireName').returns('EmpireName');

        const player = playerFactory.create(params);

        expect(player).to.be.an.instanceof(Player);

        expect(player).to.include({
            accountId: 'accountId',
            name: 'name',
            empire: 1,
            playerClass: 1,
            appearance: 'appearance',
            slot: 1,
            positionX: 300,
            positionY: 400,
            st: 10,
            ht: 10,
            dx: 10,
            iq: 10,
            health: 200,
            mana: 100,
            stamina: 50,
            hpPerLvl: 10,
            hpPerHtPoint: 2,
            mpPerLvl: 5,
            mpPerIqPoint: 1,
            baseAttackSpeed: 1.0,
            baseMovementSpeed: 1.0,
            baseHealth: 100,
            baseMana: 50,
            virtualId: 'virtualId',
            bodyPart: 'bodyPart',
            hairPart: 'hairPart',
            givenStatusPoints: 0,
            availableStatusPoints: 0,
            id: 'id',
            updatedAt: params.updatedAt,
            createdAt: params.createdAt,
            skillGroup: 'skillGroup',
            playTime: 1000,
            level: 1,
            experience: 0,
            gold: 100,
        });

        expect(player.animationManager).to.equal(animationManager);
    });

    it('should create a player with config default values when params are missing', () => {
        const params = {
            playerClass: 1,
            accountId: 'accountId',
            appearance: 'appearance',
            slot: 1,
            virtualId: 'virtualId',
            id: 'id',
            updatedAt: new Date(),
            createdAt: new Date(),
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

        sinon.stub(JobUtil, 'getClassNameFromClassId').returns('ClassName');
        sinon.stub(EmpireUtil, 'getEmpireName').returns('EmpireName');

        const player = playerFactory.create(params);

        expect(player).to.be.an.instanceof(Player);

        expect(player).to.include({
            accountId: 'accountId',
            name: 'name',
            empire: 1,
            playerClass: 1,
            appearance: 'appearance',
            slot: 1,
            positionX: 100, // default from config
            positionY: 200, // default from config
            st: 10, // default from config
            ht: 10, // default from config
            dx: 10, // default from config
            iq: 10, // default from config
            health: 100, // default from config
            mana: 50, // default from config
            stamina: 30, // default from config
            hpPerLvl: 10,
            hpPerHtPoint: 2,
            mpPerLvl: 5,
            mpPerIqPoint: 1,
            baseAttackSpeed: 1.0,
            baseMovementSpeed: 1.0,
            baseHealth: 100,
            baseMana: 50,
            virtualId: 'virtualId',
            bodyPart: undefined, // not provided
            hairPart: undefined, // not provided
            givenStatusPoints: 0,
            availableStatusPoints: 0,
            id: 'id',
            updatedAt: params.updatedAt,
            createdAt: params.createdAt,
            skillGroup: 'skillGroup',
            playTime: 1000,
            level: 1,
            experience: 0,
            gold: 100,
        });

        expect(player.animationManager).to.equal(animationManager);
    });
});
