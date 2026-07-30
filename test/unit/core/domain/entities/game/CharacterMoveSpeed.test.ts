import { expect } from 'chai';
import Character from '@/core/domain/entities/game/Character';
import Animation from '@/core/domain/Animation';
import AnimationUtil from '@/core/domain/util/AnimationUtil';
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

// A player run animation: 450 map units per second at movement speed 100.
const RUN_ANIMATION = new Animation({ duration: 1, accX: 0, accY: -450, accZ: 0 });

const createCharacter = ({ moveSpeed, animation }: { moveSpeed: number; animation?: Animation }) => {
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
            animationManager: { getAnimation: () => animation } as any,
            questManager: {} as any,
            eventTimerManager: {} as any,
        },
    );
    character.setPoint(PointsEnum.MOVE_SPEED, moveSpeed);
    return character;
};

describe('Character.getMoveDistancePerMs', () => {
    it('should report the animation speed at movement speed 100', () => {
        const character = createCharacter({ moveSpeed: 100, animation: RUN_ANIMATION });

        expect(character.getMoveDistancePerMs()).to.be.closeTo(0.45, 1e-9);
    });

    it('should agree with the duration the movement engine assigns a step', () => {
        const character = createCharacter({ moveSpeed: 150, animation: RUN_ANIMATION });
        const distance = 1234;

        const duration = AnimationUtil.calcAnimationDuration(RUN_ANIMATION, 150, distance);

        expect(character.getMoveDistancePerMs()).to.be.closeTo(distance / duration, 1e-9);
    });

    it('should scale with movement speed', () => {
        const base = createCharacter({ moveSpeed: 100, animation: RUN_ANIMATION }).getMoveDistancePerMs()!;
        const faster = createCharacter({ moveSpeed: 200, animation: RUN_ANIMATION }).getMoveDistancePerMs()!;
        const slower = createCharacter({ moveSpeed: 50, animation: RUN_ANIMATION }).getMoveDistancePerMs()!;

        expect(faster).to.be.greaterThan(base);
        expect(slower).to.be.lessThan(base);
    });

    it('should return null when the class has no run animation', () => {
        const character = createCharacter({ moveSpeed: 150 });

        expect(character.getMoveDistancePerMs()).to.be.equal(null);
    });
});
