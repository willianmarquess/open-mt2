import { expect } from 'chai';
import sinon from 'sinon';
import Player from '@/core/domain/entities/game/player/Player';
import LeaveGameService from '@/game/domain/service/LeaveGameService';
import SelectCommandHandler from '@/game/domain/command/command/select/SelectCommandHandler';

/**
 * The SELECT countdown used to call area.despawn() directly, which never
 * clears World.players — only World.despawn() does, and Player cannot reach
 * World without a DI cycle. The teardown now comes from the command handler,
 * so these specs drive the real handler and the real countdown together and
 * assert the outcome: the world no longer knows the name.
 */
describe('Player.backToSelect (World.players cleanup)', () => {
    const SECONDS_TO_LEAVE = 10;
    const NAME = 'Test';

    const build = () => {
        const players = new Map<string, unknown>();

        const world = {
            despawn: (entity: { getName: () => string }) => players.delete(entity.getName()),
            getPlayerByName: (n: string) => players.get(n),
        };

        const leaveGameService = new LeaveGameService({
            world,
            privateShopService: { closePrivateShop: sinon.stub().resolves() },
            questManager: { onLogout: sinon.stub().resolves() },
        } as never);

        const player: Record<string, unknown> = {
            getName: () => NAME,
            flushSave: sinon.stub().resolves(),
            getCurrentPrivateShopOwner: () => null,
            chat: () => {},
            isPosOneOf: () => true,
            isEventTimerActive: () => false,
            removeEventTimer: () => {},
            addEventTimer: ({ eventFunction }: { eventFunction: (count: number) => void }) => {
                player.capturedEventFunction = eventFunction;
            },
            connection: { setState: sinon.stub() },
        };

        // Real backToSelect and its private createTimedEvent, so the spec drives
        // the shipped countdown rather than a re-implementation of it.
        const proto = Player.prototype as unknown as Record<string, unknown>;
        player.backToSelect = proto.backToSelect;
        player.createTimedEvent = proto.createTimedEvent;

        players.set(NAME, player);

        const handler = new SelectCommandHandler({
            leaveGameService,
            logger: { error: sinon.stub() },
        } as never);

        return { players, world, player, handler };
    };

    const tick = (player: Record<string, unknown>, count: number) =>
        (player.capturedEventFunction as (n: number) => void)(count);

    it('removes the character from World.players when the countdown fires', async () => {
        const { world, player, handler } = build();

        await handler.execute(player as unknown as Player);
        expect(world.getPlayerByName(NAME), 'registered before the countdown').to.equal(player);

        tick(player, SECONDS_TO_LEAVE);
        await new Promise((resolve) => setImmediate(resolve));

        expect(world.getPlayerByName(NAME), 'the world must forget a character that left for select').to.equal(
            undefined,
        );
    });

    it('flushes the save on the way out, which the direct area despawn skipped', async () => {
        const { player, handler } = build();

        await handler.execute(player as unknown as Player);
        tick(player, SECONDS_TO_LEAVE);
        await new Promise((resolve) => setImmediate(resolve));

        expect((player.flushSave as sinon.SinonStub).calledOnce, 'flushSave runs before the despawn').to.equal(true);
    });

    it('still switches the connection to the select phase', async () => {
        const { player, handler } = build();

        await handler.execute(player as unknown as Player);
        tick(player, SECONDS_TO_LEAVE);

        const setState = (player.connection as { setState: sinon.SinonStub }).setState;
        expect(setState.calledOnce, 'the phase switch must not regress').to.equal(true);
    });

    it('does not leave the world before the countdown reaches zero', async () => {
        const { world, player, handler } = build();

        await handler.execute(player as unknown as Player);
        tick(player, 1);
        await new Promise((resolve) => setImmediate(resolve));

        expect(world.getPlayerByName(NAME), 'still in the world mid-countdown').to.equal(player);
    });
});
