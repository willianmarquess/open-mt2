import { expect } from 'chai';
import MathUtil from '@/core/domain/util/MathUtil';
import Monster from '@/core/domain/entities/game/mob/Monster';
import Player from '@/core/domain/entities/game/player/Player';

describe.only('MathUtil', () => {
    it('should return MAX_UINT', () => {
        expect(MathUtil.MAX_UINT).to.equal(1e9);
    });

    it('should return MAX_TINY', () => {
        expect(MathUtil.MAX_TINY).to.equal(255);
    });

    it('should calculate distance between two points', () => {
        const distance = MathUtil.calcDistance(0, 0, 3, 4);
        expect(distance).to.equal(5);
    });

    it('should calculate rotation from direction', () => {
        const rotation = MathUtil.calcRotationFromDirection(1);
        expect(rotation).to.equal(0);
    });

    it('should calculate random rotation if direction is 0', () => {
        const rotation = MathUtil.calcRotationFromDirection(0);
        expect(rotation % 45).to.equal(0);
    });

    it('should convert to unsigned number', () => {
        expect(MathUtil.toUnsignedNumber(123)).to.equal(123);
        expect(MathUtil.toUnsignedNumber(-123)).to.equal(0);
        expect(MathUtil.toUnsignedNumber('123')).to.equal(123);
        expect(MathUtil.toUnsignedNumber('abc')).to.equal(0);
    });

    it('should convert to number', () => {
        expect(MathUtil.toNumber(123)).to.equal(123);
        expect(MathUtil.toNumber('123')).to.equal(123);
        expect(MathUtil.toNumber('abc')).to.equal(0);
    });

    it('should generate random integer between min and max', () => {
        const min = 1;
        const max = 10;
        const randomInt = MathUtil.getRandomInt(min, max);
        expect(randomInt).to.be.at.least(min);
        expect(randomInt).to.be.at.most(max);
    });

    it('deve calcular a posição prevista corretamente', () => {
        // Mock do objeto Monster
        const mockMonster = {
            getPositionX: () => 0,
            getPositionY: () => 0,
            getRotation: () => 0,
            getMovementSpeed: () => 10,
        };

        // Mock do objeto Player
        const mockPlayer = {
            getPositionX: () => 100,
            getPositionY: () => 100,
            getRotation: () => 45,
            getMovementSpeed: () => 5,
        };

        // Chamada do método estático
        const result = MathUtil.calcPredictMove(mockMonster as unknown as Monster, mockPlayer as unknown as Player);

        // Validação do resultado
        expect(result).to.have.property('x').that.is.a('number');
        expect(result).to.have.property('y').that.is.a('number');
        expect(result.x).to.be.closeTo(70.71, 0.01); // Resultado esperado pode variar
        expect(result.y).to.be.closeTo(70.71, 0.01); // Resultado esperado pode variar
    });

    it('deve retornar a posição original do target se followSpeed for insuficiente', () => {
        // Mock do objeto Monster com velocidade muito baixa
        const mockMonster = {
            getPositionX: () => 0,
            getPositionY: () => 0,
            getRotation: () => 0,
            getMovementSpeed: () => 0.1,
        };

        // Mock do objeto Player
        const mockPlayer = {
            getPositionX: () => 100,
            getPositionY: () => 100,
            getRotation: () => 45,
            getMovementSpeed: () => 5,
        };

        // Chamada do método estático
        const result = MathUtil.calcPredictMove(mockMonster as unknown as Monster, mockPlayer as unknown as Player);

        // Validação do resultado
        expect(result).to.have.property('x', 100);
        expect(result).to.have.property('y', 100);
    });
});
