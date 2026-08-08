import { expect } from 'chai';
import Character from '@/core/domain/entities/game/Character';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { SLOW_AFFECT_MOVE_SPEED_PENALTY } from '@/core/domain/entities/game/shared/AffectConstants';

class TestCharacter extends Character {
    private moveSpeed = 100;
    public timersRemoved = 0;

    constructor() {
        super(
            {
                id: 1,
                classId: 0,
                virtualId: 1,
                entityType: 0,
                positionX: 0,
                positionY: 0,
                name: 'Test',
                empire: 1,
            } as any,
            {
                animationManager: { getAnimation: () => undefined } as any,
                questManager: {} as any,
                eventTimerManager: { removeAllTimersFromOwner: () => {} } as any,
            },
        );
    }

    addPoint(point: PointsEnum, value: number): void {
        if (point === PointsEnum.MOVE_SPEED) this.moveSpeed += value;
    }
    setPoint(): void {}
    getPoint(point: PointsEnum): number {
        return point === PointsEnum.MOVE_SPEED ? this.moveSpeed : 0;
    }
    getHealthPercentage(): number {
        return 0;
    }
    getAttack(): number {
        return 0;
    }
    getDefense(): number {
        return 0;
    }
    removeTimers(): void {
        this.timersRemoved++;
    }
}

describe('battle affects on death (issue #163)', () => {
    it('should clear a stun instead of leaving it set after death', () => {
        const character = new TestCharacter();
        character.setAffectFlag(AffectBitsTypeEnum.STUN);

        character.die();

        expect(character.isAffectByFlag(AffectBitsTypeEnum.STUN), 'the client stays input locked otherwise').to.be
            .false;
    });

    it('should clear poison, which otherwise blocks regeneration for the session', () => {
        const character = new TestCharacter();
        character.setAffectFlag(AffectBitsTypeEnum.POISON);

        character.die();

        expect(character.isAffectByFlag(AffectBitsTypeEnum.POISON)).to.be.false;
    });

    it('should clear slow and give the movement speed penalty back', () => {
        const character = new TestCharacter();
        character.addPoint(PointsEnum.MOVE_SPEED, -SLOW_AFFECT_MOVE_SPEED_PENALTY);
        character.setAffectFlag(AffectBitsTypeEnum.SLOW);

        character.die();

        expect(character.isAffectByFlag(AffectBitsTypeEnum.SLOW)).to.be.false;
        expect(
            character.getPoint(PointsEnum.MOVE_SPEED),
            'a mob never recomputes move speed on respawn, so an unreturned penalty is permanent',
        ).to.equal(100);
    });

    it('should not hand back a penalty that was never applied', () => {
        const character = new TestCharacter();

        character.die();

        expect(character.getPoint(PointsEnum.MOVE_SPEED)).to.equal(100);
    });

    it('should leave affects that death does not own alone', () => {
        const character = new TestCharacter();
        character.setAffectFlag(AffectBitsTypeEnum.POLYMORPH);
        character.setAffectFlag(AffectBitsTypeEnum.STUN);

        character.die();

        expect(character.isAffectByFlag(AffectBitsTypeEnum.POLYMORPH), 'only the battle debuffs are cleared').to.be
            .true;
        expect(character.isAffectByFlag(AffectBitsTypeEnum.STUN)).to.be.false;
    });

    it('should still remove the timers', () => {
        const character = new TestCharacter();

        character.die();

        expect(character.timersRemoved).to.equal(1);
    });
});
