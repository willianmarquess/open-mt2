import { expect } from 'chai';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

/**
 * Covers issue #88: /goto must warp the character instead of despawning it and
 * cancelling. The spec drives the real command through the chat channel and
 * asserts the TeleportPacket the client would warp from.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Bug — /goto teleports instead of despawning the player (issue #88)', function () {
    this.timeout(60000);

    const TRAVELLER = 'goto_teleport_test';
    const ORIGIN_X = 958870;
    const ORIGIN_Y = 272760;
    const TARGET_X = ORIGIN_X + 2000;
    const TARGET_Y = ORIGIN_Y + 2000;

    let harness: AttackHarness;
    let session: AttackSession;

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        await session?.close();
        await harness?.stop();
    });

    it('answers /goto location with a TeleportPacket to those coordinates', async () => {
        session = await harness.login({ username: TRAVELLER, x: ORIGIN_X, y: ORIGIN_Y });

        const player = harness.findPlayer(TRAVELLER);
        expect(player, 'setup: the character reached the world').to.not.equal(undefined);

        session.flush();
        session.command(`/goto location ${TARGET_X} ${TARGET_Y}`);
        await session.settle(800);

        expect(session.received().includes('teleport canceled'), 'the teleport was not cancelled').to.equal(false);

        // The warp the client acts on: header, then the destination.
        const warp = Buffer.alloc(9);
        warp.writeUInt8(PacketHeaderEnum.TELEPORT, 0);
        warp.writeUInt32LE(TARGET_X, 1);
        warp.writeUInt32LE(TARGET_Y, 5);

        expect(session.received().includes(warp), 'the TeleportPacket was sent').to.equal(true);
        expect(player.getPositionX(), 'the server moved the character').to.equal(TARGET_X);
        expect(player.getPositionY()).to.equal(TARGET_Y);
    });
});
