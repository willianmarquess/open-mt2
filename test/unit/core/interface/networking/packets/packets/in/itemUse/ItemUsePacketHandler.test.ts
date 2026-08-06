import { expect } from 'chai';
import sinon from 'sinon';
import ItemUsePacketHandler from '@/core/interface/networking/packets/packet/in/itemUse/ItemUsePacketHandler';
import ItemMovePacketHandler from '@/core/interface/networking/packets/packet/in/itemMove/ItemMovePacketHandler';
import GameConnection from '@/game/interface/networking/GameConnection';

/**
 * Regression for issue #103: both handlers dispatched their service without
 * awaiting it, so a rejection inside the service escaped the dispatcher's
 * catch and reached the process-level unhandledRejection handler, which
 * main.ts turns into a process exit. Awaiting is what lets GameServer's
 * .catch see it.
 */
describe('Item handlers propagate service rejections (issue #103)', () => {
    const logger = () => ({ error: sinon.spy(), info: sinon.spy(), debug: sinon.spy() });

    const connectionWithPlayer = () =>
        ({
            getPlayer: () => ({ getName: () => 'tester' }),
            close: sinon.spy(),
        }) as unknown as GameConnection;

    const usePacket = () =>
        ({
            isValid: () => true,
            getWindow: () => 1,
            getPosition: () => 0,
        }) as any;

    const movePacket = () =>
        ({
            isValid: () => true,
            getFromWindow: () => 1,
            getFromPosition: () => 0,
            getToWindow: () => 1,
            getToPosition: () => 1,
            getCount: () => 1,
        }) as any;

    it('should surface a failing item use instead of leaking its rejection to the process', async () => {
        const failure = new Error('boom');
        const useItemService = { execute: sinon.stub().rejects(failure) };
        const handler = new ItemUsePacketHandler({ logger: logger() as any, useItemService: useItemService as any });

        const outcome = await handler
            .execute(connectionWithPlayer(), usePacket())
            .then(() => 'resolved')
            .catch((err) => err);

        expect(outcome, 'the caller can see the failure').to.equal(failure);
    });

    it('should surface a failing item move instead of leaking its rejection to the process', async () => {
        const failure = new Error('boom');
        const moveItemService = { execute: sinon.stub().rejects(failure) };
        const handler = new ItemMovePacketHandler({ logger: logger() as any, moveItemService: moveItemService as any });

        const outcome = await handler
            .execute(connectionWithPlayer(), movePacket())
            .then(() => 'resolved')
            .catch((err) => err);

        expect(outcome, 'the caller can see the failure').to.equal(failure);
    });

    it('should still resolve normally when the item use succeeds', async () => {
        const useItemService = { execute: sinon.stub().resolves() };
        const handler = new ItemUsePacketHandler({ logger: logger() as any, useItemService: useItemService as any });

        await handler.execute(connectionWithPlayer(), usePacket());

        expect(useItemService.execute.calledOnceWith(sinon.match.any, 1, 0)).to.equal(true);
    });
});
