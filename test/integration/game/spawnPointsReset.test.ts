import { expect } from 'chai';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { ItemEquipmentSlotEnum } from '@/core/enum/ItemEquipmentSlotEnum';
import { WindowTypeEnum } from '@/core/enum/WindowTypeEnum';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import BufferWriter from '@/core/interface/networking/buffer/BufferWriter';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

// Needs MySQL + Redis and free auth/game ports. Items are stored before login,
// so these cases exercise SelectCharacter -> item loading -> World.spawn.
describe('Spawn preserves equipment bonuses and stored resources (issue #251)', function () {
    this.timeout(60_000);

    const SWORD_VNUM = 10; // Sword+0: APPLY_ATT_SPEED 22.
    const BASE_ATTACK_SPEED = 150;
    const EQUIPPED_ATTACK_SPEED = BASE_ATTACK_SPEED + 22;
    const WEAPON_POSITION = 90 + ItemEquipmentSlotEnum.WEAPON;
    const storedSword = { protoId: SWORD_VNUM, window: WindowTypeEnum.EQUIPMENT, position: WEAPON_POSITION };

    let harness: AttackHarness;
    const sessions: Array<AttackSession> = [];

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        for (const session of sessions) await session.close();
        await harness?.stop();
    });

    const useItem = (session: AttackSession, window: WindowTypeEnum, position: number) => {
        const packet = new BufferWriter(PacketHeaderEnum.ITEM_USE, 4);
        session.sendSequenced(packet.writeUint8(window).writeUint16LE(position).getBuffer());
    };

    it('loads a worn weapon, caps effective speed, and removes its bonus exactly once when unequipped', async () => {
        const username = 'spawngear_test';
        const session = await harness.login({ username, items: [storedSword] });
        sessions.push(session);
        const player = harness.findPlayer(username)!;
        const sword = player.getInventory().getItem(WEAPON_POSITION)!;

        expect(player.getEquippedItems().map((item: { getId(): number }) => item.getId())).to.include(SWORD_VNUM);
        expect(player.getPoint(PointsEnum.ATTACK_SPEED)).to.equal(EQUIPPED_ATTACK_SPEED);
        expect(player.getAttackSpeed()).to.equal(170);

        useItem(session, WindowTypeEnum.EQUIPMENT, WEAPON_POSITION);
        await session.settle();
        expect(player.getEquippedItems()).to.have.length(0);
        expect(player.getPoint(PointsEnum.ATTACK_SPEED)).to.equal(BASE_ATTACK_SPEED);

        expect(sword.getWindow()).to.equal(WindowTypeEnum.INVENTORY);
        useItem(session, WindowTypeEnum.INVENTORY, sword.getPosition());
        await session.settle();
        expect(player.getPoint(PointsEnum.ATTACK_SPEED)).to.equal(EQUIPPED_ATTACK_SPEED);
        expect(player.getAttackSpeed()).to.equal(170);
    });

    it('preserves stored health and mana on login', async () => {
        const username = 'spawnhealth_test';
        const session = await harness.login({ username, health: 137, mana: 73 });
        sessions.push(session);
        const player = harness.findPlayer(username)!;

        expect(player.getPoint(PointsEnum.MAX_HEALTH)).to.be.greaterThan(137);
        expect(player.getPoint(PointsEnum.MAX_MANA)).to.be.greaterThan(73);
        expect(player.getPoint(PointsEnum.HEALTH)).to.equal(137);
        expect(player.getPoint(PointsEnum.MANA)).to.equal(73);
    });

    it('keeps equipment bonuses while the level command explicitly restores health and mana', async () => {
        const username = 'spawnlevel_test';
        const session = await harness.login({ username, health: 137, mana: 73, items: [storedSword] });
        sessions.push(session);
        const player = harness.findPlayer(username)!;

        session.command('/lvl 99');
        await session.settle();
        expect(player.getPoint(PointsEnum.ATTACK_SPEED)).to.equal(EQUIPPED_ATTACK_SPEED);
        expect(player.getPoint(PointsEnum.HEALTH)).to.equal(player.getPoint(PointsEnum.MAX_HEALTH));
        expect(player.getPoint(PointsEnum.MANA)).to.equal(player.getPoint(PointsEnum.MAX_MANA));
    });
});
