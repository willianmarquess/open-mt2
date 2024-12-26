import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
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
        };

        dropItemService = new DropItemService({
            logger: loggerMock,
            itemManager: itemManagerMock,
        });
    });

    describe('execute', function () {
        it('should drop gold if gold is greater than 0', async function () {
            const playerMock = {
                getGold: sinon.stub().returns(100),
                addGold: sinon.spy(),
                dropItem: sinon.spy(),
                chat: sinon.spy(),
                getName: sinon.stub().returns('TestPlayer'),
            };

            await dropItemService.execute({
                window: 1,
                position: 0,
                gold: 50,
                count: 0,
                player: playerMock as unknown as Player,
            });

            expect(playerMock.addGold.calledOnceWith(-50)).to.be.true;
            expect(playerMock.dropItem.calledOnce).to.be.true;
            expect(playerMock.chat.notCalled).to.be.true;
        });

        it('should not drop more gold than the player has', async function () {
            const playerMock = {
                getGold: sinon.stub().returns(30),
                addGold: sinon.spy(),
                dropItem: sinon.spy(),
                chat: sinon.spy(),
                getName: sinon.stub().returns('TestPlayer'),
            };

            await dropItemService.execute({
                window: 1,
                position: 0,
                gold: 50,
                count: 0,
                player: playerMock as unknown as Player,
            });

            expect(playerMock.addGold.notCalled).to.be.true;
            expect(playerMock.dropItem.notCalled).to.be.true;
            expect(playerMock.chat.calledOnce).to.be.true;
            expect(playerMock.chat.firstCall.args[0]).to.deep.equal({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'You are trying to drop more gold than you have',
            });
            expect(loggerMock.error.calledOnce).to.be.true;
        });

        it('should drop item completely if count matches item count', async function () {
            const itemMock = {
                getCount: sinon.stub().returns(5),
                getSize: sinon.stub().returns(1),
            };

            const playerMock = {
                getInventory: sinon.stub().returns({
                    getItem: sinon.stub().returns(itemMock),
                    removeItem: sinon.spy(),
                }),
                sendItemRemoved: sinon.spy(),
                dropItem: sinon.spy(),
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
            const itemMock = {
                getCount: sinon.stub().returns(10),
                setCount: sinon.spy(),
            };

            const playerMock = {
                getInventory: sinon.stub().returns({
                    getItem: sinon.stub().returns(itemMock),
                }),
                sendItemAdded: sinon.spy(),
                dropItem: sinon.spy(),
            };

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
            expect(itemManagerMock.delete.calledOnceWith(itemMock)).to.be.true;
        });

        it('should do nothing if item is not found', async function () {
            const playerMock = {
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
