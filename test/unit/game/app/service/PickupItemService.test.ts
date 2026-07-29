import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import PickupItemService from '@/game/app/service/PickupItemService';
import { expect } from 'chai';
import sinon from 'sinon';

describe('PickupItemService', function () {
    const AREA = { name: 'area1' };
    const OTHER_AREA = { name: 'area2' };
    const POSITION = { x: 1000, y: 1000 };

    /** Stubs the position/area getters every pickup goes through. */
    const atPosition = (area: unknown, x: number, y: number) => ({
        getArea: sinon.stub().returns(area),
        getPositionX: sinon.stub().returns(x),
        getPositionY: sinon.stub().returns(y),
    });

    let worldMock;
    let itemRepositoryMock;
    let entityManagerMock: any;
    let pickupItemService: PickupItemService;

    beforeEach(function () {
        worldMock = {
            despawn: sinon.stub(),
        };

        itemRepositoryMock = {
            create: sinon.stub(),
        };

        entityManagerMock = {
            getEntity: sinon.stub(),
        };

        pickupItemService = new PickupItemService({
            world: worldMock,
            itemRepository: itemRepositoryMock,
            entityManager: entityManagerMock,
        });
    });

    describe('execute', function () {
        it('should add gold to the player and despawn the item if it is gold', async function () {
            const playerMock = {
                getName: sinon.stub().returns('player1'),
                addItem: sinon.stub().returns(true),
                chat: sinon.spy(),
                addPoint: sinon.spy(),
                ...atPosition(AREA, POSITION.x, POSITION.y),
            };
            const droppedItemMock = {
                getItem: sinon.stub().returns({ getId: sinon.stub().returns(1) }),
                getCount: sinon.stub().returns(100),
                getOwnerName: sinon.stub().returns('player1'),
                ...atPosition(AREA, POSITION.x, POSITION.y),
            };

            entityManagerMock.getEntity.returns(droppedItemMock);

            await pickupItemService.execute(playerMock as unknown as Player, 1);

            expect(playerMock.addPoint.calledOnceWith(PointsEnum.GOLD, 100)).to.be.true;
            expect(worldMock.despawn.calledOnceWith(droppedItemMock)).to.be.true;
        });

        it('should add item to the player and despawn the item if it is not gold and can be picked up', async function () {
            const itemMock = {
                getId: sinon.stub().returns(2),
                toDatabase: sinon.stub().returns({}),
                setDbId: sinon.spy(),
            };
            const playerMock = {
                getName: sinon.stub().returns('player1'),
                addItemStacking: sinon.stub().returns({ updated: [], inserted: itemMock }),
                chat: sinon.spy(),
                addPoint: sinon.spy(),
                ...atPosition(AREA, POSITION.x, POSITION.y),
            };
            const droppedItemMock = {
                getItem: sinon.stub().returns(itemMock),
                getCount: sinon.stub().returns(1),
                getOwnerName: sinon.stub().returns('player1'),
                ...atPosition(AREA, POSITION.x, POSITION.y),
            };

            entityManagerMock.getEntity.returns(droppedItemMock);

            await pickupItemService.execute(playerMock as unknown as Player, 1);

            expect(playerMock.addItemStacking.calledOnceWith(itemMock)).to.be.true;
            expect(worldMock.despawn.calledOnceWith(droppedItemMock)).to.be.true;
            expect(itemRepositoryMock.create.calledOnceWith({})).to.be.true;
        });

        it('should not allow the player to pick up the item if it is not theirs', async function () {
            const playerMock = {
                getName: sinon.stub().returns('player1'),
                addItem: sinon.stub().returns(false),
                chat: sinon.spy(),
                addPoint: sinon.spy(),
                ...atPosition(AREA, POSITION.x, POSITION.y),
            };
            const droppedItemMock = {
                getItem: sinon.stub().returns({ getId: sinon.stub().returns(2) }),
                getCount: sinon.stub().returns(1),
                getOwnerName: sinon.stub().returns('player2'),
                ...atPosition(AREA, POSITION.x, POSITION.y),
            };

            entityManagerMock.getEntity.returns(droppedItemMock);

            await pickupItemService.execute(playerMock as unknown as Player, 1);

            expect(
                playerMock.chat.calledOnceWith({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: '[SYSTEM] This item is not yours',
                }),
            ).to.be.true;
            expect(worldMock.despawn.called).to.be.false;
            expect(itemRepositoryMock.create.called).to.be.false;
        });

        it('should not pick up an item that is out of range (issue #66)', async function () {
            const playerMock = {
                getName: sinon.stub().returns('player1'),
                addItemStacking: sinon.stub().returns({ updated: [], inserted: null }),
                chat: sinon.spy(),
                addPoint: sinon.spy(),
                ...atPosition(AREA, POSITION.x, POSITION.y),
            };
            const droppedItemMock = {
                getItem: sinon.stub().returns({ getId: sinon.stub().returns(2) }),
                getCount: sinon.stub().returns(1),
                getOwnerName: sinon.stub().returns('player1'),
                ...atPosition(AREA, POSITION.x + 1000, POSITION.y),
            };

            entityManagerMock.getEntity.returns(droppedItemMock);

            await pickupItemService.execute(playerMock as unknown as Player, 1);

            expect(playerMock.addItemStacking.called).to.be.false;
            expect(worldMock.despawn.called).to.be.false;
        });

        it('should not pick up an item that is in another area (issue #66)', async function () {
            const playerMock = {
                getName: sinon.stub().returns('player1'),
                addItemStacking: sinon.stub().returns({ updated: [], inserted: null }),
                chat: sinon.spy(),
                addPoint: sinon.spy(),
                ...atPosition(AREA, POSITION.x, POSITION.y),
            };
            const droppedItemMock = {
                getItem: sinon.stub().returns({ getId: sinon.stub().returns(2) }),
                getCount: sinon.stub().returns(1),
                getOwnerName: sinon.stub().returns('player1'),
                ...atPosition(OTHER_AREA, POSITION.x, POSITION.y),
            };

            entityManagerMock.getEntity.returns(droppedItemMock);

            await pickupItemService.execute(playerMock as unknown as Player, 1);

            expect(playerMock.addItemStacking.called).to.be.false;
            expect(worldMock.despawn.called).to.be.false;
        });

        it('should not give gold dropped by someone else (issue #66)', async function () {
            const playerMock = {
                getName: sinon.stub().returns('player1'),
                addItem: sinon.stub().returns(true),
                chat: sinon.spy(),
                addPoint: sinon.spy(),
                ...atPosition(AREA, POSITION.x, POSITION.y),
            };
            const droppedItemMock = {
                getItem: sinon.stub().returns({ getId: sinon.stub().returns(1) }),
                getCount: sinon.stub().returns(100),
                getOwnerName: sinon.stub().returns('player2'),
                ...atPosition(AREA, POSITION.x, POSITION.y),
            };

            entityManagerMock.getEntity.returns(droppedItemMock);

            await pickupItemService.execute(playerMock as unknown as Player, 1);

            expect(playerMock.addPoint.called).to.be.false;
            expect(worldMock.despawn.called).to.be.false;
        });

        it('should do nothing if the dropped item is not found', async function () {
            const playerMock = {
                getName: sinon.stub().returns('player1'),
                addItem: sinon.stub().returns(false),
                chat: sinon.spy(),
                addPoint: sinon.spy(),
            };

            entityManagerMock.getEntity.returns(null);

            await pickupItemService.execute(playerMock as unknown as Player, 1);

            expect(playerMock.addPoint.called).to.be.false;
            expect(playerMock.addItem.called).to.be.false;
            expect(playerMock.chat.called).to.be.false;
        });
    });
});
