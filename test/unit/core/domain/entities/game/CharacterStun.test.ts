import { expect } from 'chai';
import sinon from 'sinon';
import Character from '@/core/domain/entities/game/Character';
import Player from '@/core/domain/entities/game/player/Player';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { PositionEnum } from '@/core/enum/PositionEnum';

class TestCharacter extends Character {
    private readonly testPoints = new Map<PointsEnum, number>();

    readonly sendSyncPosition = sinon.spy();

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

    /** stun() is protected; specs drive it the way the battle code does. */
    applyStun() {
        this.stun();
    }

    walkTowards(x: number, y: number) {
        this.targetPositionX = x;
        this.targetPositionY = y;
        this.startPositionX = this.positionX;
        this.startPositionY = this.positionY;
    }

    futurePosition() {
        return { x: this.targetPositionX, y: this.targetPositionY };
    }

    startPosition() {
        return { x: this.startPositionX, y: this.startPositionY };
    }

    getPos() {
        return this.pos;
    }
}

const AT_X = 100;
const AT_Y = 200;

const createCharacter = (entityType: EntityTypeEnum = EntityTypeEnum.MONSTER) =>
    new TestCharacter(
        {
            id: 1,
            classId: 1,
            virtualId: 7,
            entityType,
            positionX: AT_X,
            positionY: AT_Y,
            name: 'test',
            empire: 1,
        },
        {
            animationManager: {} as any,
            questManager: {} as any,
            eventTimerManager: {} as any,
        },
    );

const nearbyPlayer = (virtualId: number) => {
    const player = sinon.createStubInstance(Player);
    player.getVirtualId.returns(virtualId);
    player.getEntityType.returns(EntityTypeEnum.PLAYER);
    player.isPlayer.returns(true);
    return player;
};

describe('Character stun (issue #52)', function () {
    afterEach(function () {
        sinon.restore();
    });

    it('drops the future position of a character that was moving', function () {
        const character = createCharacter();
        character.walkTowards(5000, 6000);

        character.applyStun();

        expect(character.futurePosition()).to.deep.equal({ x: AT_X, y: AT_Y });
        expect(character.startPosition()).to.deep.equal({ x: AT_X, y: AT_Y });
    });

    it('syncs the new position to every nearby player', function () {
        const character = createCharacter();
        const watcher = nearbyPlayer(8);
        character.addNearbyEntity(watcher as unknown as Player);
        character.walkTowards(5000, 6000);

        character.applyStun();

        expect(watcher.sendSyncPosition.calledOnceWith(character as unknown as Character)).to.be.true;
    });

    it('syncs to the stunned player as well, the way PacketView includes self', function () {
        const character = createCharacter(EntityTypeEnum.PLAYER);
        character.walkTowards(5000, 6000);

        character.applyStun();

        expect(character.sendSyncPosition.calledOnceWith(character)).to.be.true;
    });

    it('leaves a character that was standing still untouched', function () {
        const character = createCharacter(EntityTypeEnum.PLAYER);
        const watcher = nearbyPlayer(8);
        character.addNearbyEntity(watcher as unknown as Player);

        character.applyStun();

        expect(watcher.sendSyncPosition.called, 'nothing to snap the client to').to.be.false;
        expect(character.sendSyncPosition.called).to.be.false;
    });

    it('takes a fighting character out of the fighting position', function () {
        const character = createCharacter();
        character.walkTowards(5000, 6000);
        character.setPos(PositionEnum.FIGHTING);

        character.applyStun();

        expect(character.getPos()).to.equal(PositionEnum.STANDING);
    });
});
