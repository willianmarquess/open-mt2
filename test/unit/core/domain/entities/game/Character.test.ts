import { expect } from 'chai';
import Character from '@/core/domain/entities/game/Character';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';

class TestCharacter extends Character {
    private readonly testPoints = new Map<PointsEnum, number>();

    addPoint(point: PointsEnum, value: number): void {
        this.testPoints.set(point, (this.testPoints.get(point) ?? 0) + value);
    }
    setPoint(point: PointsEnum, value: number): void {
        this.testPoints.set(point, value);
    }
    getPoint(point: PointsEnum): number {
        return this.testPoints.get(point) ?? 0;
    }
    getHealthPercentage(): number {
        return 100;
    }
    getAttack(): number {
        return 0;
    }
    getDefense(): number {
        return 0;
    }
    onSpawn(): void {}
    onDespawn(): void {}
}

const createCharacter = ({ dx, level }: { dx: number; level: number }) => {
    const character = new TestCharacter(
        {
            id: 1,
            classId: 1,
            virtualId: 1,
            entityType: EntityTypeEnum.PLAYER,
            positionX: 0,
            positionY: 0,
            name: 'test',
            empire: 1,
        },
        {
            animationManager: {} as any,
            questManager: {} as any,
            eventTimerManager: {} as any,
        },
    );
    character.setPoint(PointsEnum.DX, dx);
    character.setPoint(PointsEnum.LEVEL, level);
    return character;
};

describe('Character', () => {
    describe('getAttackRating', () => {
        it('should calculate rating as (dx * 4 + level * 2) / 6', () => {
            const character = createCharacter({ dx: 30, level: 30 });
            expect(character.getAttackRating()).to.be.equal((30 * 4 + 30 * 2) / 6);
        });

        it('should not cap rating for average stats', () => {
            const character = createCharacter({ dx: 60, level: 45 });
            expect(character.getAttackRating()).to.be.equal((60 * 4 + 45 * 2) / 6);
            expect(character.getAttackRating()).to.be.lessThan(90);
        });

        it('should cap rating at 90', () => {
            const character = createCharacter({ dx: 200, level: 99 });
            expect(character.getAttackRating()).to.be.equal(90);
        });

        it('should return 0 when character has no dexterity and no level', () => {
            const character = createCharacter({ dx: 0, level: 0 });
            expect(character.getAttackRating()).to.be.equal(0);
        });
    });
});
