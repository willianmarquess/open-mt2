import { expect } from 'chai';
import sinon from 'sinon';
import ItemDropPacketHandler from '@/core/interface/networking/packets/packet/in/itemDrop/ItemDropPacketHandler';

const createHandler = (execute: sinon.SinonStub) => {
    const handler = new ItemDropPacketHandler({
        logger: { info: () => {}, error: () => {}, debug: () => {} } as any,
        dropItemService: { execute } as any,
    });

    const connection = {
        getPlayer: () => ({ getName: () => 'dropper' }),
        close: sinon.stub(),
    };

    const packet = {
        isValid: () => true,
        getWindow: () => 1,
        getPosition: () => 0,
        getGold: () => 0,
        getCount: () => 1,
    };

    return { handler, connection, packet };
};

describe('ItemDropPacketHandler', () => {
    afterEach(() => sinon.restore());

    it('should surface a service failure to the caller instead of leaking it', async () => {
        const failure = new Error('drop blew up');
        const { handler, connection, packet } = createHandler(sinon.stub().rejects(failure));

        // GameServer.onData catches what execute() rejects with; anything the
        // handler drops on the floor becomes an unhandledRejection instead.
        const caught = await handler.execute(connection as any, packet as any).catch((err) => err);

        expect(caught, 'the rejection reached the dispatch catch').to.equal(failure);
    });

    it('should still drop the item on the happy path', async () => {
        const execute = sinon.stub().resolves();
        const { handler, connection, packet } = createHandler(execute);

        await handler.execute(connection as any, packet as any);

        expect(execute.calledOnce).to.be.true;
        expect(execute.firstCall.args[0]).to.include({ window: 1, position: 0, gold: 0, count: 1 });
    });
});
