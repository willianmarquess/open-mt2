import { expect } from 'chai';
import Character from '@/core/domain/entities/game/Character';
import Player from '@/core/domain/entities/game/player/Player';
import Stone from '@/core/domain/entities/game/mob/Stone';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';

/**
 * The original clamps speeds at read time in GetLimitPoint (char.cpp:2914-2970):
 * 170/200 for players, 250 for everything else. Without the clamp the raw
 * accumulator reaches the uint8 packet fields, and any value above 255 makes
 * pack() throw ERR_OUT_OF_RANGE, which closes the connection.
 */

const makeFake = (points: Partial<Record<PointsEnum, number>>, isPlayer: boolean) => ({
    getPoint: (point: PointsEnum) => points[point] ?? 0,
    isPlayer: () => isPlayer,
});

const attackSpeedOf = (points: Partial<Record<PointsEnum, number>>, isPlayer: boolean) =>
    Character.prototype.getAttackSpeed.call(makeFake(points, isPlayer));

const moveSpeedOf = (points: Partial<Record<PointsEnum, number>>, isPlayer: boolean) =>
    Character.prototype.getMovementSpeed.call(makeFake(points, isPlayer));

describe('speed limit points (GetLimitPoint port)', () => {
    it('clamps a player attack speed at 170', () => {
        // base 150 + the Saw Tooth Knife apply of 114
        expect(attackSpeedOf({ [PointsEnum.ATTACK_SPEED]: 264 }, true)).to.equal(170);
    });

    it('clamps a player movement speed at 200', () => {
        expect(moveSpeedOf({ [PointsEnum.MOVE_SPEED]: 320 }, true)).to.equal(200);
    });

    it('clamps a mob speed at 250', () => {
        // Metin of Black (vnum 8005): move_speed 310, attack_speed 305
        expect(moveSpeedOf({ [PointsEnum.MOVE_SPEED]: 310 }, false)).to.equal(250);
        expect(attackSpeedOf({ [PointsEnum.ATTACK_SPEED]: 305 }, false)).to.equal(250);
    });

    it('passes an in-range speed through unchanged', () => {
        expect(attackSpeedOf({ [PointsEnum.ATTACK_SPEED]: 165 }, true)).to.equal(165);
        expect(moveSpeedOf({ [PointsEnum.MOVE_SPEED]: 150 }, true)).to.equal(150);
        expect(moveSpeedOf({ [PointsEnum.MOVE_SPEED]: 240 }, false)).to.equal(240);
    });

    it('floors a negative accumulator at 0, as GetLimitPoint does', () => {
        expect(moveSpeedOf({ [PointsEnum.MOVE_SPEED]: -30 }, false)).to.equal(0);
    });
});

describe('speed bytes on the wire', () => {
    const packed: Array<Buffer> = [];

    const makeStone = () => {
        const stone = Object.create(Stone.prototype);
        return Object.assign(stone, {
            getVirtualId: () => 7,
            getClassId: () => 8005,
            getEntityType: () => EntityTypeEnum.METIN_STONE,
            getPoint: (point: PointsEnum) =>
                point === PointsEnum.MOVE_SPEED ? 310 : point === PointsEnum.ATTACK_SPEED ? 305 : 0,
            getPositionX: () => 100,
            getPositionY: () => 100,
            getEmpire: () => 0,
            getLevel: () => 1,
            getName: () => 'Metin of Black',
            getRotation: () => 0,
            isDead: () => false,
        });
    };

    const makeViewer = () => {
        const viewer = Object.create(Player.prototype);
        return Object.assign(viewer, {
            connection: { send: (packet: { pack: () => Buffer }) => packed.push(packet.pack()) },
        });
    };

    beforeEach(() => {
        packed.length = 0;
    });

    it('spawns a metin stone without killing the connection', () => {
        // Without the clamp this throws ERR_OUT_OF_RANGE at writeUint8(310):
        // the stone protos on the starter maps all carry speeds above 255.
        Player.prototype.onNearbyEntityAdded.call(makeViewer(), makeStone());

        const spawn = packed[0];
        expect(spawn, 'the spawn packet must reach the wire').to.be.instanceOf(Buffer);
        expect(spawn[24], 'movementSpeed byte').to.equal(250);
        expect(spawn[25], 'attackSpeed byte').to.equal(250);
    });

    it('updates a player wearing a +114 attack speed dagger without killing the connection', () => {
        const player = Object.create(Player.prototype);
        Object.assign(player, {
            virtualId: 99,
            points: {
                getPoint: (point: PointsEnum) =>
                    point === PointsEnum.ATTACK_SPEED ? 264 : point === PointsEnum.MOVE_SPEED ? 150 : 0,
            },
            getEntityType: () => EntityTypeEnum.PLAYER,
            getBody: () => null,
            getWeapon: () => null,
            getHair: () => null,
            getAffectFlags: () => [0, 0],
            horse: { getMountVnum: () => 0 },
            nearbyEntities: new Map(),
            connection: { send: (packet: { pack: () => Buffer }) => packed.push(packet.pack()) },
        });

        // Without the clamp this throws ERR_OUT_OF_RANGE at writeUint8(264).
        Player.prototype.updateView.call(player);

        const update = packed[0];
        expect(update[13], 'moveSpeed byte').to.equal(150);
        expect(update[14], 'attackSpeed byte').to.equal(170);
    });
});
