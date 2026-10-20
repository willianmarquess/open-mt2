import { expect } from 'chai';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import QuestTargetCreatePacket from '@/core/interface/networking/packets/packet/out/QuestTargetCreatePacket';
import ItemDroppedHidePacket from '@/core/interface/networking/packets/packet/out/ItemDroppedHidePacket';

describe('Fixed-size outbound packets (#152)', () => {
    for (const targetName of ['Hunt Quest', 'A'.repeat(40)]) {
        it(`should serialize a 43-byte quest target with a ${targetName.length}-character name`, () => {
            const packet = new QuestTargetCreatePacket({
                id: 0x12345678,
                targetName,
                targetVirtualId: 0xabcdef01,
                type: 2,
            });
            const buffer = packet.pack();

            expect(buffer).to.have.lengthOf(43);
            expect(buffer.readUInt8(0)).to.equal(PacketHeaderEnum.QUEST_TARGET_CREATE);
            expect(buffer.readUInt32LE(1)).to.equal(0x12345678);
            const name = Buffer.alloc(33);
            name.write(targetName.substring(0, 32), 'ascii');
            expect(buffer.subarray(5, 38)).to.deep.equal(name);
            expect(buffer.readUInt32LE(38)).to.equal(0xabcdef01);
            expect(buffer.readUInt8(42)).to.equal(2);
        });
    }

    it('should serialize a 5-byte ground-item removal followed immediately by the next packet', () => {
        const hide = new ItemDroppedHidePacket({ virtualId: 0x12345678 }).pack();
        const target = new QuestTargetCreatePacket({
            id: 1,
            targetName: '',
            targetVirtualId: 0,
            type: 1,
        }).pack();

        expect(hide).to.have.lengthOf(5);
        expect(hide.readUInt8(0)).to.equal(PacketHeaderEnum.ITEM_DROPPED_HIDE);
        expect(hide.readUInt32LE(1)).to.equal(0x12345678);
        const stream = Buffer.concat([hide, target, hide]);
        expect(stream).to.have.lengthOf(53);
        expect(stream.readUInt8(5)).to.equal(PacketHeaderEnum.QUEST_TARGET_CREATE);
        expect(stream.readUInt8(48)).to.equal(PacketHeaderEnum.ITEM_DROPPED_HIDE);
    });
});
