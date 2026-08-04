import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { ItemAntiFlagEnum } from '@/core/enum/ItemAntiFlagEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import BitFlag from '@/core/util/BitFlag';
import DropItemService from '@/game/app/service/DropItemService';
import { expect } from 'chai';
import sinon from 'sinon';

describe('DropItemService', function () {
    let loggerMock;
    let itemManagerMock;
    let dropItemService: DropItemService;

    beforeEach(function () {
        loggerMock = {
            error: sinon.spy(),
        };

        itemManagerMock = {
            delete: sinon.stub().resolves(),
            update: sinon.stub().resolves(),
            flush: sinon.stub().resolves(),
            getItem: sinon.stub().callsFake((id: number, count: number) => ({
                getId: () => id,
                getCount: () => count,
            })),
        };

        dropItemService = new DropItemService({
            logger: loggerMock,
            itemManager: itemManagerMock,
        });
    });

    const partialDropSetup = () => {
        const itemMock = {
            getId: sinon.stub().returns(27001),
            getCount: sinon.stub().returns(10),
            setCount: sinon.spy(),
            getAntiFlags: sinon.stub().returns(new BitFlag()),
        };

        const playerMock = {
            getId: sinon.stub().returns(7),
            isItemLockedInPrivateShop: sinon.stub().returns(false),
            getInventory: sinon.stub().returns({
                getItem: sinon.stub().returns(itemMock),
            }),
            sendItemAdded: sinon.spy(),
            dropItem: sinon.spy(),
        };

        return { itemMock, playerMock };
    };

    describe('execute', function () {
        it('should drop gold if gold is greater than 0', async function () {
            const playerMock = {
                getPoint: sinon.stub().returns(100),
                dropItem: sinon.spy(),
                chat: sinon.spy(),
                getName: sinon.stub().returns('TestPlayer'),
                isItemLockedInPrivateShop: sinon.stub().returns(false),
                addPoint: sinon.spy(),
            };

            await dropItemService.execute({
                window: 1,
                position: 0,
                gold: 50,
                count: 0,
                player: playerMock as unknown as Player,
            });

            expect(playerMock.addPoint.calledOnceWith(PointsEnum.GOLD, -50)).to.be.true;
            expect(playerMock.dropItem.calledOnce).to.be.true;
            expect(playerMock.chat.notCalled).to.be.true;
        });

        it('should drop gold as a real item, so the ground entity can be rendered', async function () {
            const playerMock = {
                getPoint: sinon.stub().returns(100),
                dropItem: sinon.spy(),
                chat: sinon.spy(),
                getName: sinon.stub().returns('TestPlayer'),
                isItemLockedInPrivateShop: sinon.stub().returns(false),
                addPoint: sinon.spy(),
            };

            await dropItemService.execute({
                window: 1,
                position: 0,
                gold: 50,
                count: 0,
                player: playerMock as unknown as Player,
            });

            const { item, count } = playerMock.dropItem.firstCall.args[0];
            expect(item.getId(), 'the gold proto').to.equal(1);
            expect(item.getCount(), 'built for the dropped amount').to.equal(50);
            expect(count).to.equal(50);
        });

        it('should not drop more gold than the player has', async function () {
            const playerMock = {
                getPoint: sinon.stub().returns(30),
                dropItem: sinon.spy(),
                chat: sinon.spy(),
                getName: sinon.stub().returns('TestPlayer'),
                isItemLockedInPrivateShop: sinon.stub().returns(false),
                addPoint: sinon.spy(),
            };

            await dropItemService.execute({
                window: 1,
                position: 0,
                gold: 50,
                count: 0,
                player: playerMock as unknown as Player,
            });

            expect(playerMock.addPoint.notCalled).to.be.true;
            expect(playerMock.dropItem.notCalled).to.be.true;
            expect(playerMock.chat.calledOnce).to.be.true;
            expect(playerMock.chat.firstCall.args[0]).to.deep.equal({
                messageType: ChatMessageTypeEnum.INFO,
                message: '[SYSTEM] You are trying to drop more gold than you have',
            });
            expect(loggerMock.error.calledOnce).to.be.true;
        });

        it('should drop item completely if count matches item count', async function () {
            const itemMock = {
                getCount: sinon.stub().returns(5),
                getSize: sinon.stub().returns(1),
                getAntiFlags: sinon.stub().returns(new BitFlag()),
            };

            const playerMock = {
                isItemLockedInPrivateShop: sinon.stub().returns(false),
                getInventory: sinon.stub().returns({
                    getItem: sinon.stub().returns(itemMock),
                    removeItem: sinon.spy(),
                }),
                sendItemRemoved: sinon.spy(),
                dropItem: sinon.spy(),
                addPoint: sinon.spy(),
            };

            await dropItemService.execute({
                window: 1,
                position: 0,
                gold: 0,
                count: 5,
                player: playerMock as unknown as Player,
            });

            expect(playerMock.getInventory().getItem.calledOnceWith(0)).to.be.true;
            expect(playerMock.getInventory().removeItem.calledOnceWith(0, 1)).to.be.true;
            expect(playerMock.sendItemRemoved.calledOnce).to.be.true;
            expect(playerMock.dropItem.calledOnce).to.be.true;
            expect(itemManagerMock.delete.calledOnceWith(itemMock)).to.be.true;
        });

        it('should update item count if count is less than item count', async function () {
            const { itemMock, playerMock } = partialDropSetup();

            await dropItemService.execute({
                window: 1,
                position: 0,
                gold: 0,
                count: 5,
                player: playerMock as unknown as Player,
            });

            expect(itemMock.setCount.calledOnceWith(5)).to.be.true;
            expect(playerMock.sendItemAdded.calledOnce).to.be.true;
            expect(playerMock.dropItem.calledOnce).to.be.true;
        });

        it('should keep the surviving stack in the database on a partial drop (issue #90)', async function () {
            const { itemMock, playerMock } = partialDropSetup();

            await dropItemService.execute({
                window: 1,
                position: 0,
                gold: 0,
                count: 5,
                player: playerMock as unknown as Player,
            });

            expect(itemManagerMock.delete.called, 'the stack that stays is never deleted').to.be.false;
            expect(itemManagerMock.update.calledOnceWith(itemMock), 'its row is updated').to.be.true;
            expect(itemManagerMock.flush.calledOnce, 'and flushed').to.be.true;
        });

        it('should ground the dropped amount, not the remainder (issue #90)', async function () {
            const { itemMock, playerMock } = partialDropSetup();

            await dropItemService.execute({
                window: 1,
                position: 0,
                gold: 0,
                count: 5,
                player: playerMock as unknown as Player,
            });

            const { item, count } = playerMock.dropItem.firstCall.args[0];
            expect(item, 'a separate instance leaves the inventory').to.not.equal(itemMock);
            expect(item.getId(), 'same proto').to.equal(27001);
            expect(item.getCount(), 'worth the dropped amount').to.equal(5);
            expect(count).to.equal(5);
        });

        it('should not touch the stack when the proto is missing (issue #90)', async function () {
            const { itemMock, playerMock } = partialDropSetup();
            itemManagerMock.getItem.returns(null);

            await dropItemService.execute({
                window: 1,
                position: 0,
                gold: 0,
                count: 5,
                player: playerMock as unknown as Player,
            });

            expect(itemMock.setCount.called, 'the stack is left alone').to.be.false;
            expect(playerMock.dropItem.called).to.be.false;
            expect(itemManagerMock.delete.called).to.be.false;
            expect(loggerMock.error.calledOnce).to.be.true;
        });

        const antiFlagDropSetup = (flag: number) => {
            const antiFlags = new BitFlag();
            antiFlags.set(flag);

            const itemMock = {
                getCount: sinon.stub().returns(5),
                getSize: sinon.stub().returns(1),
                getAntiFlags: sinon.stub().returns(antiFlags),
            };

            const playerMock = {
                isItemLockedInPrivateShop: sinon.stub().returns(false),
                getInventory: sinon.stub().returns({
                    getItem: sinon.stub().returns(itemMock),
                    removeItem: sinon.spy(),
                }),
                sendItemRemoved: sinon.spy(),
                dropItem: sinon.spy(),
                chat: sinon.spy(),
            };

            return { itemMock, playerMock };
        };

        it('should refuse to drop an item carrying ANTI_DROP (issue #97)', async function () {
            const { playerMock } = antiFlagDropSetup(ItemAntiFlagEnum.ANTI_DROP);

            await dropItemService.execute({
                window: 1,
                position: 0,
                gold: 0,
                count: 5,
                player: playerMock as unknown as Player,
            });

            expect(playerMock.getInventory().removeItem.called, 'the item stays in the inventory').to.be.false;
            expect(playerMock.dropItem.called, 'nothing hits the ground').to.be.false;
            expect(itemManagerMock.delete.called, 'the row survives').to.be.false;
            expect(playerMock.chat.calledOnce).to.be.true;
            expect(playerMock.chat.firstCall.args[0]).to.deep.equal({
                messageType: ChatMessageTypeEnum.INFO,
                message: '[SYSTEM] This item cannot be dropped',
            });
        });

        it('should refuse to drop an item carrying ANTI_GIVE, like the original (issue #97)', async function () {
            const { playerMock } = antiFlagDropSetup(ItemAntiFlagEnum.ANTI_GIVE);

            await dropItemService.execute({
                window: 1,
                position: 0,
                gold: 0,
                count: 5,
                player: playerMock as unknown as Player,
            });

            expect(playerMock.getInventory().removeItem.called).to.be.false;
            expect(playerMock.dropItem.called).to.be.false;
            expect(playerMock.chat.calledOnce).to.be.true;
        });

        it('should still drop an item whose anti-flags do not include ANTI_DROP or ANTI_GIVE', async function () {
            const { playerMock } = antiFlagDropSetup(ItemAntiFlagEnum.ANTI_SELL);

            await dropItemService.execute({
                window: 1,
                position: 0,
                gold: 0,
                count: 5,
                player: playerMock as unknown as Player,
            });

            expect(playerMock.dropItem.calledOnce, 'ANTI_SELL alone does not block a drop').to.be.true;
            expect(playerMock.chat.called).to.be.false;
        });

        it('should do nothing if item is not found', async function () {
            const playerMock = {
                isItemLockedInPrivateShop: sinon.stub().returns(false),
                getInventory: sinon.stub().returns({
                    getItem: sinon.stub().returns(undefined),
                }),
            };

            await dropItemService.execute({
                window: 1,
                position: 0,
                gold: 0,
                count: 5,
                player: playerMock as unknown as Player,
            });

            expect(playerMock.getInventory().getItem.calledOnceWith(0)).to.be.true;
            expect(itemManagerMock.delete.notCalled).to.be.true;
        });
    });
});
