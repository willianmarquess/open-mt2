import { createConnection, Socket } from 'node:net';
import GameApplication from '@/game/app/GameApplication';
import { container } from '@/game/Container';
import BufferWriter from '@/core/interface/networking/buffer/BufferWriter';
import BufferReader from '@/core/interface/networking/buffer/BufferReader';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import CacheKeyGenerator from '@/core/util/CacheKeyGenerator';
import Monster from '@/core/domain/entities/game/mob/Monster';
import DroppedItem from '@/core/domain/entities/game/item/DroppedItem';
import { PointsEnum } from '@/core/enum/PointsEnum';

/**
 * A "malicious client" test harness: it speaks the raw game protocol against a
 * real, in-process game server and can send arbitrary — including malformed —
 * packets, then observe how the server reacted (responses, persisted state, and
 * whether it stayed alive).
 *
 * It deliberately boots GameApplication directly rather than through main.ts, so
 * the process-level `unhandledRejection -> process.exit` handler is NOT
 * installed — otherwise a single DoS reproduction would tear down the whole test
 * runner. Instead the harness installs its own listener and exposes the captured
 * rejections for assertions.
 *
 * Requires MySQL + Redis (docker) and a free game port (stop `dev:game` first).
 */
export default class AttackHarness {
    /**
     * The game container is a module-level singleton, so its database pool and
     * cache client can only be opened once per process. The server is therefore
     * booted on the first start() and shared by every spec file; shutdown()
     * closes it once, from the root hook in setup.integration.ts.
     */
    private static shared: AttackHarness | null = null;

    private app!: GameApplication;
    private readonly rejections: unknown[] = [];
    private readonly onRejection = (reason: unknown) => this.rejections.push(reason);
    private readonly seededAccounts: Array<string> = [];

    private get db() {
        return container.resolve<any>('databaseManager');
    }
    private get cache() {
        return container.resolve<any>('cacheProvider');
    }
    private get host() {
        return container.resolve<any>('config').SERVER_ADDRESS as string;
    }
    private get port() {
        return Number(container.resolve<any>('config').SERVER_PORT);
    }

    async start() {
        if (AttackHarness.shared) return AttackHarness.shared;

        // Capture unhandled rejections instead of letting Node's default handler
        // crash the runner. This is the whole point of owning the server here.
        process.on('unhandledRejection', this.onRejection);
        this.app = new GameApplication(container.cradle as any);
        await this.app.start();
        AttackHarness.shared = this;
        return this;
    }

    /** Drops the accounts this spec seeded; the server stays up for the next one. */
    async stop() {
        for (const username of this.seededAccounts) {
            await this.db.getConnection().query('DELETE FROM auth.account WHERE username = ?', [username]);
            await this.db.getConnection().query('DELETE FROM game.player WHERE name = ?', [username]);
        }
        this.seededAccounts.length = 0;
        this.rejections.length = 0;
    }

    static async shutdown() {
        const harness = AttackHarness.shared;
        if (!harness) return;

        await harness.app.close();
        process.off('unhandledRejection', harness.onRejection);
        AttackHarness.shared = null;
    }

    /** Unhandled rejections seen since start (e.g. the RangeError from issue #69). */
    capturedRejections() {
        return this.rejections;
    }

    private get entityManager() {
        return container.resolve<any>('entityManager');
    }

    private get world() {
        return container.resolve<any>('world');
    }

    /**
     * Every live entity in the world. Tests use this to learn virtual ids the
     * attacker is not supposed to know — which is exactly the attacker's own
     * position, since virtual ids are sequential and trivially guessable.
     */
    private entities(): Array<any> {
        return [...this.entityManager.entities.values()];
    }

    findMonster(): Monster | undefined {
        return this.entities().find((entity) => entity instanceof Monster);
    }

    /** Every live monster, for specs that need one with particular surroundings. */
    findMonsters(): Array<Monster> {
        return this.entities().filter((entity) => entity instanceof Monster);
    }

    /** The area owning these coordinates, or undefined where none does. */
    areaAt(x: number, y: number) {
        return this.world.getArea(x, y);
    }

    /**
     * A monster still standing on the area that spawned it. An entity's area is
     * stamped once and never re-evaluated, so a monster that charged a target
     * can sit on coordinates no area owns — and seeding a character there makes
     * World.spawn drop it silently.
     */
    findMonsterInPlace(): Monster | undefined {
        return this.findMonsters().find(
            (monster) =>
                monster.getPoint(PointsEnum.HEALTH) > 0 &&
                monster.getArea() &&
                this.areaAt(monster.getPositionX(), monster.getPositionY()) === monster.getArea(),
        );
    }

    /** Retried across ticks: mobs reach the world through the area spawn queue. */
    async awaitMonsterInPlace(timeoutMs = 8_000): Promise<Monster | undefined> {
        const deadline = Date.now() + timeoutMs;
        do {
            const monster = this.findMonsterInPlace();
            if (monster) return monster;
            await new Promise((resolve) => setTimeout(resolve, 250));
        } while (Date.now() < deadline);
        return undefined;
    }

    /** The most recently spawned ground item, so earlier specs cannot shadow it. */
    findDroppedItem(): DroppedItem | undefined {
        return this.entities().findLast((entity) => entity instanceof DroppedItem);
    }

    findPlayer(name: string) {
        return this.entities().find((entity) => entity?.getName?.() === name);
    }

    /** The live entity behind a virtual id, or undefined once it despawned. */
    findEntity(virtualId: number) {
        return this.entityManager.getEntity(virtualId);
    }

    /**
     * True while the game server still accepts TCP connections — probed the same
     * way an external observer sees it, rather than by reaching into internals.
     * This is exactly the signal that flipped to false when issue #69 crashed the
     * real server (port 13001 stopped listening).
     */
    isServerAlive(): Promise<boolean> {
        return new Promise((resolve) => {
            const probe = createConnection({ host: this.host, port: this.port });
            probe.on('connect', () => {
                probe.destroy();
                resolve(true);
            });
            probe.on('error', () => resolve(false));
        });
    }

    /**
     * Seed an account + level-99 character, inject a valid session token into the
     * cache (bypassing the auth server), then connect and walk the enter-game
     * handshake. Returns a session bound to that character.
     */
    async login({ username = 'attacker', x = 958870, y = 272760 } = {}) {
        const hash = '$2b$05$KXeREc2TNuUR6IcgzUiX4.WA/0i3Yd3WpUHMtAcQi1ojWRdeQ9ExS'; // 'admin'
        await this.db.getConnection().query('DELETE FROM auth.account WHERE username = ?', [username]);
        const [res] = await this.db
            .getConnection()
            .query(
                `INSERT INTO auth.account (deleteCode, email, password, accountStatusId, username) VALUES (?,?,?,?,?)`,
                ['1234567', `${username}@test.com`, hash, 1, username],
            );
        const accountId = res.insertId;
        await this.db.getConnection().query('DELETE FROM game.player WHERE name = ?', [username]);
        await this.db.getConnection().query(
            `INSERT INTO game.player (accountId, empire, playerClass, skillGroup, playTime, level, experience,
                gold, st, ht, dx, iq, positionX, positionY, health, mana, stamina, bodyPart, hairPart, name,
                givenStatusPoints, availableStatusPoints, slot, skills)
             VALUES (?, 2, 4, 0, 9105, 99, 0, 12038002, 17, 107, 12, 6, ?, ?, 15950, 5570, 1000, 0, 0, ?, 396, 192, 0, '[]')`,
            [accountId, x, y, username],
        );
        this.seededAccounts.push(username);

        // The auth server would have written this; we inject it directly.
        const key = 0x0badf00d;
        await this.cache.set(
            CacheKeyGenerator.createTokenKey(String(key)),
            JSON.stringify({ username, accountId }),
            300,
        );

        const session = new AttackSession(this.host, this.port, this.db);
        try {
            await session.enterGame(username, key);
            await this.awaitInWorld(username, x, y);
        } catch (error) {
            // An orphaned socket keeps the server's close() waiting for the
            // rest of the run, so it has to go before the failure propagates.
            await session.close();
            throw error;
        }
        return session;
    }

    /**
     * Spawns are queued to the next area tick, so the character is not in the
     * world when enterGame resolves — and World.spawn drops it outright when no
     * area owns (x, y). Failing by name here stops every spec from going on to
     * assert against an undefined entity.
     */
    private async awaitInWorld(username: string, x: number, y: number) {
        const deadline = Date.now() + 5_000;
        do {
            if (this.findPlayer(username)) return;
            await new Promise((resolve) => setTimeout(resolve, 50));
        } while (Date.now() < deadline);

        const area = this.areaAt(x, y);
        throw new Error(
            `[harness] ${username} never entered the world at (${x}, ${y}); ` +
                `World.getArea says ${area ? area.getName() : 'no area owns that spot'}`,
        );
    }
}

/** One connected, in-game client used to fire packets and inspect the result. */
export class AttackSession {
    private client!: Socket;
    private buffer: Buffer = Buffer.from([]);

    constructor(
        private readonly host: string,
        private readonly port: number,
        private readonly db: any,
    ) {}

    private connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client = createConnection({ host: this.host, port: this.port }, () => resolve());
            this.client.on('data', (d) => (this.buffer = Buffer.concat([this.buffer, d])));
            this.client.on('error', reject);
        });
    }

    private next(length: number, timeoutMs = 10_000): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const deadline = Date.now() + timeoutMs;
            const tick = () => {
                if (this.buffer.length >= length) {
                    const out = this.buffer.subarray(0, length);
                    this.buffer = this.buffer.subarray(length);
                    return resolve(out);
                }
                if (Date.now() > deadline) {
                    return reject(
                        new Error(`[harness] timed out waiting for ${length} bytes, got ${this.buffer.length}`),
                    );
                }
                setTimeout(tick, 20);
            };
            tick();
        });
    }

    async enterGame(username: string, token: number) {
        await this.connect();

        await this.next(2); // HANDSHAKE state
        const hs = await this.next(13);
        const r = new BufferReader();
        r.setBuffer(hs);
        const id = r.readUInt32LE();
        const time = r.readUInt32LE();
        const delta = r.readUInt32LE();
        const reply = new BufferWriter(PacketHeaderEnum.HANDSHAKE, 13);
        this.send(reply.writeUint32LE(id).writeUint32LE(time).writeUint32LE(delta).getBuffer());

        await this.next(2); // LOGIN state
        const auth = new BufferWriter(PacketHeaderEnum.TOKEN, 52);
        auth.writeString(username, 31)
            .writeUint32LE(token)
            .writeUint32LE(0)
            .writeUint32LE(0)
            .writeUint32LE(0)
            .writeUint32LE(0);
        this.sendSequenced(auth.getBuffer());

        await this.next(3); // empire
        await this.next(331); // player list
        const select = new BufferWriter(PacketHeaderEnum.SELECT_CHARACTER, 2);
        this.sendSequenced(select.writeUint8(0).getBuffer());

        await this.next(2); // LOADING state
        await this.next(46); // character detail
        this.sendSequenced(new BufferWriter(PacketHeaderEnum.ENTER_GAME, 1).getBuffer());
        await this.settle(600);
        this.flush();
    }

    /** Fire a raw command through the chat channel (e.g. "/item 27001 5"). */
    command(message: string) {
        const size = 1 + 2 + 1 + message.length + 1;
        const w = new BufferWriter(PacketHeaderEnum.CHAT_IN, size);
        this.sendSequenced(
            w
                .writeUint16LE(size)
                .writeUint8(0)
                .writeString(message, message.length + 1)
                .getBuffer(),
        );
    }

    /** Fire a raw item-drop packet (window u8, position u16, gold u32, count u8). */
    drop(window: number, position: number, gold: number, count: number) {
        const w = new BufferWriter(PacketHeaderEnum.ITEM_DROP, 9);
        this.sendSequenced(
            w.writeUint8(window).writeUint16LE(position).writeUint32LE(gold).writeUint8(count).getBuffer(),
        );
    }

    /** Fire a raw item-pickup packet for an arbitrary virtual id. */
    pickup(virtualId: number) {
        const w = new BufferWriter(PacketHeaderEnum.ITEM_PICKUP, 5);
        this.sendSequenced(w.writeUint32LE(virtualId).getBuffer());
    }

    /** Fire a raw attack packet at an arbitrary virtual id. */
    attack(virtualId: number, attackType = 0) {
        const w = new BufferWriter(PacketHeaderEnum.ATTACK, 8);
        this.sendSequenced(w.writeUint8(attackType).writeUint32LE(virtualId).writeUint8(0).writeUint8(0).getBuffer());
    }

    /** Fire a raw character-move packet (the client reports where it now is). */
    move(x: number, y: number, movementType = 1, time = 0) {
        const w = new BufferWriter(PacketHeaderEnum.CHARACTER_MOVE, 16);
        this.send(
            w
                .writeUint8(movementType)
                .writeUint8(0)
                .writeUint8(0)
                .writeUint32LE(x)
                .writeUint32LE(y)
                .writeUint32LE(time)
                .getBuffer(),
        );
    }

    send(buffer: Buffer) {
        this.client.write(buffer);
    }

    /**
     * Send a packet the way the real client does: with a trailing sequence byte.
     * The server only needs to skip it, so the value is irrelevant here.
     */
    sendSequenced(buffer: Buffer) {
        this.send(Buffer.concat([buffer, Buffer.of(0)]));
    }

    /** Wait for the server to finish processing what we just sent. */
    settle(ms = 300) {
        return new Promise((r) => setTimeout(r, ms));
    }

    flush() {
        this.buffer = Buffer.from([]);
    }

    received() {
        return this.buffer;
    }

    /** The persisted stacks of a given proto for this session's character. */
    async dbItems(username: string, protoId: number) {
        const [rows] = await this.db.getConnection().query(
            `SELECT i.count, i.window, i.position FROM game.item i
                 JOIN game.player p ON p.id = i.ownerId WHERE p.name = ? AND i.protoId = ?`,
            [username, protoId],
        );
        return rows as Array<{ count: number; window: number; position: number }>;
    }

    async close() {
        if (!this.client || this.client.destroyed) return;
        return new Promise<void>((resolve) => this.client.end(() => resolve()));
    }
}
