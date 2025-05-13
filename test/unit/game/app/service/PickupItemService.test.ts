import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import PickupItemService from '@/game/app/service/PickupItemService';
import { expect } from 'chai';
import sinon from 'sinon';

describe('PickupItemService', function () {
    let worldMock;
    let itemRepositoryMock;
    let pickupItemService: PickupItemService;

    beforeEach(function () {
        worldMock = {
            getEntityArea: sinon.stub(),
        };

        itemRepositoryMock = {
            create: sinon.stub(),
        };

        pickupItemService = new PickupItemService({ world: worldMock, itemRepository: itemRepositoryMock });
    });

    describe('execute', function () {
        it('should add gold to the player and despawn the item if it is gold', async function () {
            const playerMock = {
                getName: sinon.stub().returns('player1'),
                addItem: sinon.stub().returns(true),
                chat: sinon.spy(),
                addPoint: sinon.spy(),
            };
            const droppedItemMock = {
                getItem: sinon.stub().returns({ getId: sinon.stub().returns(1) }),
                getCount: sinon.stub().returns(100),
                getOwnerName: sinon.stub().returns('player1'),
            };
            const areaMock = {
                getEntity: sinon.stub().returns(droppedItemMock),
                despawn: sinon.spy(),
            };

            worldMock.getEntityArea.returns(areaMock);

            await pickupItemService.execute(playerMock as unknown as Player, 1);

            expect(playerMock.addPoint.calledOnceWith(PointsEnum.GOLD, 100)).to.be.true;
            expect(areaMock.despawn.calledOnceWith(droppedItemMock)).to.be.true;
        });

        it('should add item to the player and despawn the item if it is not gold and can be picked up', async function () {
            const playerMock = {
                getName: sinon.stub().returns('player1'),
                addItem: sinon.stub().returns(true),
                chat: sinon.spy(),
                addPoint: sinon.spy(),
            };
            const itemMock = {
                getId: sinon.stub().returns(2),
                toDatabase: sinon.stub().returns({}),
            };
            const droppedItemMock = {
                getItem: sinon.stub().returns(itemMock),
                getCount: sinon.stub().returns(1),
                getOwnerName: sinon.stub().returns('player1'),
            };
            const areaMock = {
                getEntity: sinon.stub().returns(droppedItemMock),
                despawn: sinon.spy(),
            };

            worldMock.getEntityArea.returns(areaMock);

            await pickupItemService.execute(playerMock as unknown as Player, 1);

            expect(playerMock.addItem.calledOnceWith(itemMock)).to.be.true;
            expect(areaMock.despawn.calledOnceWith(droppedItemMock)).to.be.true;
            expect(itemRepositoryMock.create.calledOnceWith({})).to.be.true;
        });

        it('should not allow the player to pick up the item if it is not theirs', async function () {
            const playerMock = {
                getName: sinon.stub().returns('player1'),
                addItem: sinon.stub().returns(false),
                chat: sinon.spy(),
                addPoint: sinon.spy(),
            };
            const droppedItemMock = {
                getItem: sinon.stub().returns({ getId: sinon.stub().returns(2) }),
                getCount: sinon.stub().returns(1),
                getOwnerName: sinon.stub().returns('player2'),
            };
            const areaMock = {
                getEntity: sinon.stub().returns(droppedItemMock),
                despawn: sinon.spy(),
            };

            worldMock.getEntityArea.returns(areaMock);

            await pickupItemService.execute(playerMock as unknown as Player, 1);

            expect(
                playerMock.chat.calledOnceWith({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: '[SYSTEM] This item is not yours',
                }),
            ).to.be.true;
            expect(areaMock.despawn.called).to.be.false;
            expect(itemRepositoryMock.create.called).to.be.false;
        });

        it('should do nothing if the area is not found', async function () {
            const playerMock = {
                getName: sinon.stub().returns('player1'),
                addItem: sinon.stub().returns(false),
                chat: sinon.spy(),
                addPoint: sinon.spy(),
            };

            worldMock.getEntityArea.returns(null);

            await pickupItemService.execute(playerMock as unknown as Player, 1);

            expect(playerMock.addPoint.called).to.be.false;
            expect(playerMock.addItem.called).to.be.false;
            expect(playerMock.chat.called).to.be.false;
        });

        it('should do nothing if the dropped item is not found', async function () {
            const playerMock = {
                getName: sinon.stub().returns('player1'),
                addItem: sinon.stub().returns(false),
                chat: sinon.spy(),
                addPoint: sinon.spy(),
            };
            const areaMock = {
                getEntity: sinon.stub().returns(null),
                despawn: sinon.spy(),
            };

            worldMock.getEntityArea.returns(areaMock);

            await pickupItemService.execute(playerMock as unknown as Player, 1);

            expect(playerMock.addPoint.called).to.be.false;
            expect(playerMock.addItem.called).to.be.false;
            expect(playerMock.chat.called).to.be.false;
        });
    });
});
