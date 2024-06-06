import { expect } from 'chai';
import PlayerDTO from '../../../../../src/core/domain/dto/PlayerDTO.js';

describe('PlayerDTO', function () {
    it('should create an instance with all properties set correctly', function () {
        const playerData = {
            id: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            accountId: 100,
            empire: 1,
            playerClass: 2,
            skillGroup: 3,
            playTime: 120,
            level: 15,
            experience: 5000,
            gold: 1000,
            st: 10,
            ht: 10,
            dx: 10,
            iq: 10,
            positionX: 50,
            positionY: 50,
            health: 100,
            mana: 50,
            stamina: 75,
            bodyPart: 2,
            hairPart: 3,
            name: 'TestPlayer',
            givenStatusPoints: 5,
            availableStatusPoints: 10,
            slot: 1,
        };

        const playerDTO = new PlayerDTO(playerData);

        expect(playerDTO).to.include(playerData);
    });

    it('should set default values for missing properties', function () {
        const playerData = {
            id: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
            accountId: 101,
            empire: 2,
            playerClass: 1,
            positionX: 100,
            positionY: 200,
            health: 150,
            mana: 75,
            stamina: 50,
        };

        const playerDTO = new PlayerDTO(playerData);

        expect(playerDTO.skillGroup).to.equal(0);
        expect(playerDTO.playTime).to.equal(0);
        expect(playerDTO.level).to.equal(1);
        expect(playerDTO.experience).to.equal(0);
        expect(playerDTO.gold).to.equal(0);
        expect(playerDTO.st).to.equal(0);
        expect(playerDTO.ht).to.equal(0);
        expect(playerDTO.dx).to.equal(0);
        expect(playerDTO.iq).to.equal(0);
        expect(playerDTO.bodyPart).to.equal(0);
        expect(playerDTO.hairPart).to.equal(0);
        expect(playerDTO.name).to.equal('');
        expect(playerDTO.givenStatusPoints).to.equal(0);
        expect(playerDTO.availableStatusPoints).to.equal(0);
        expect(playerDTO.slot).to.equal(0);
    });

    it('should override default values with provided values', function () {
        const playerData = {
            id: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
            accountId: 102,
            empire: 1,
            playerClass: 2,
            skillGroup: 1,
            playTime: 50,
            level: 10,
            experience: 2000,
            gold: 500,
            st: 5,
            ht: 5,
            dx: 5,
            iq: 5,
            positionX: 300,
            positionY: 400,
            health: 80,
            mana: 40,
            stamina: 60,
            bodyPart: 1,
            hairPart: 2,
            name: 'AnotherPlayer',
            givenStatusPoints: 2,
            availableStatusPoints: 5,
            slot: 2,
        };

        const playerDTO = new PlayerDTO(playerData);

        expect(playerDTO.skillGroup).to.equal(playerData.skillGroup);
        expect(playerDTO.playTime).to.equal(playerData.playTime);
        expect(playerDTO.level).to.equal(playerData.level);
        expect(playerDTO.experience).to.equal(playerData.experience);
        expect(playerDTO.gold).to.equal(playerData.gold);
        expect(playerDTO.st).to.equal(playerData.st);
        expect(playerDTO.ht).to.equal(playerData.ht);
        expect(playerDTO.dx).to.equal(playerData.dx);
        expect(playerDTO.iq).to.equal(playerData.iq);
        expect(playerDTO.bodyPart).to.equal(playerData.bodyPart);
        expect(playerDTO.hairPart).to.equal(playerData.hairPart);
        expect(playerDTO.name).to.equal(playerData.name);
        expect(playerDTO.givenStatusPoints).to.equal(playerData.givenStatusPoints);
        expect(playerDTO.availableStatusPoints).to.equal(playerData.availableStatusPoints);
        expect(playerDTO.slot).to.equal(playerData.slot);
    });
});
