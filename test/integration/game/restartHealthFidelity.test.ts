import { expect } from 'chai';
import { PointsEnum } from '@/core/enum/PointsEnum';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

/**
 * A restart used to end in `area.spawn`, whose queued respawn re-ran `onSpawn`
 * and therefore `init()` -> `calcPointsAndResetValues()` -> `resetHealth()`,
 * handing back a full bar. The original gives a flat 50 HP
 * (cmd_general.cpp:641) and only re-announces the character
 * (RestartAtSamePos, char.cpp:768) rather than re-initialising it.
 *
 * The second assertion is the one that matters for playability: the client
 * draws the character lying down after death, so the re-announce has to reach
 * it with an alive state byte or the character would stand up server-side
 * while still looking dead on screen.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Restart health fidelity', function () {
    this.timeout(60000);

    const RESTART_HEALTH = 50;
    const CHARACTER_SPAWN_HEADER = 0x01;
    // header, vid(4), rotation(4), x(4), y(4), z(4), entityType(1), class(2),
    // moveSpeed(1), attackSpeed(1), state(1)
    const SPAWN_ENTITY_TYPE_OFFSET = 21;
    const SPAWN_STATE_OFFSET = 26;
    const ENTITY_TYPE_PLAYER = 6;
    const ALIVE = 0;

    const REVIVER = 'reviver_test';

    let harness: AttackHarness;
    let session: AttackSession;

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        await session?.close();
        await harness?.stop();
    });

    async function liveMonster() {
        let monster = harness.findMonster();
        for (let attempt = 0; attempt < 20 && !monster?.getPoint(PointsEnum.HEALTH); attempt++) {
            await new Promise((resolve) => setTimeout(resolve, 250));
            monster = harness.findMonster();
        }

        expect(monster, 'setup: the world spawned a monster').to.not.equal(undefined);
        return monster!;
    }

    // Spawns are queued to the next area tick, so a character is not in the
    // world the instant login resolves.
    async function livePlayer(username: string) {
        let player = harness.findPlayer(username);
        for (let attempt = 0; attempt < 20 && !player; attempt++) {
            await new Promise((resolve) => setTimeout(resolve, 250));
            player = harness.findPlayer(username);
        }

        expect(player, 'setup: the character reached the world').to.not.equal(undefined);
        return player!;
    }

    /**
     * Scan the raw stream for this character's spawn packet and read its state
     * byte. The harness keeps an unframed byte stream, so the header and the
     * virtual id alone produce false matches on unrelated payloads — the entity
     * type has to agree as well before a hit is believed.
     */
    function findSpawnState(buffer: Buffer, virtualId: number): number | null {
        for (let i = 0; i + SPAWN_STATE_OFFSET < buffer.length; i++) {
            if (buffer[i] !== CHARACTER_SPAWN_HEADER) continue;
            if (buffer.readUInt32LE(i + 1) !== virtualId) continue;
            if (buffer.readUInt8(i + SPAWN_ENTITY_TYPE_OFFSET) !== ENTITY_TYPE_PLAYER) continue;
            return buffer.readUInt8(i + SPAWN_STATE_OFFSET);
        }
        return null;
    }

    it('revives on the flat restart health and tells the client to stand up', async () => {
        // takeDamage is a direct server-side call and needs no proximity, so we
        // log in at the harness default location (always valid) and only use the
        // monster as the attacker reference — logging in on a monster's position
        // is flaky, since some spawn at locations the world rejects.
        const monster = await liveMonster();

        session = await harness.login({ username: REVIVER });

        const player = await livePlayer(REVIVER);

        const maxHealth = player.getPoint(PointsEnum.MAX_HEALTH);
        expect(maxHealth, 'setup: a full bar is well above the restart value').to.be.greaterThan(RESTART_HEALTH * 4);

        player.takeDamage(monster, player.getPoint(PointsEnum.HEALTH) + 1);
        expect(player.isDead(), 'setup: the character died').to.equal(true);

        session.flush();
        session.command('/restart_here');
        await session.settle(800);

        expect(player.isDead(), 'the restart revived the character').to.equal(false);
        expect(player.getPoint(PointsEnum.HEALTH), 'the restart did not hand back a full bar').to.equal(RESTART_HEALTH);
        expect(
            findSpawnState(session.received(), player.getVirtualId()),
            'the client was re-announced the character as alive',
        ).to.equal(ALIVE);
    });
});
