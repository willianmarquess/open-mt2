import { expect } from 'chai';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

/**
 * Feature test for issue #56: chat never left the sender. NORMAL and SHOUT both
 * ended in a TODO, so two players standing on the same tile could not see each
 * other talk.
 *
 * The assertions decode CHAT_OUT off the wire rather than reaching into the
 * server, because the fields the client needs are exactly what was missing: a
 * relayed line carries the speaker's vid, and a shout carries none at all.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Chat broadcast (issue #56)', function () {
    this.timeout(60000);

    const SPEAKER = 'chat_speaker';
    const LISTENER = 'chat_listener';

    let harness: AttackHarness;
    let speaker: AttackSession;
    let listener: AttackSession;

    type ChatPacket = { messageType: number; vid: number; message: string };

    /** Every well-formed CHAT_OUT packet sitting in a session's read buffer. */
    const chatPackets = (buffer: Buffer): Array<ChatPacket> => {
        const packets: Array<ChatPacket> = [];

        for (let at = 0; at + 10 <= buffer.length; at++) {
            if (buffer[at] !== PacketHeaderEnum.CHAT_OUT) continue;

            const size = buffer.readUInt16LE(at + 1);
            if (size < 10 || at + size > buffer.length) continue;
            if (buffer[at + size - 1] !== 0) continue;

            const message = buffer.toString('ascii', at + 9, at + size - 1);
            if (!/^[\x20-\x7e]*$/.test(message)) continue;

            packets.push({ messageType: buffer[at + 3], vid: buffer.readUInt32LE(at + 4), message });
            at += size - 1;
        }

        return packets;
    };

    before(async () => {
        harness = await new AttackHarness().start();
        speaker = await harness.login({ username: SPEAKER });
        listener = await harness.login({ username: LISTENER });
        await listener.settle(600);
        speaker.flush();
        listener.flush();
    });

    after(async () => {
        await speaker?.close();
        await listener?.close();
        await harness?.stop();
    });

    it('relays an ordinary message to a nearby player under the speaker vid', async () => {
        const speakerVid = harness.findPlayer(SPEAKER)?.getVirtualId();
        expect(speakerVid, 'the speaker is in the world').to.be.a('number');

        speaker.chat('hello there');
        await speaker.settle(600);

        const heard = chatPackets(listener.received()).filter(
            (packet) => packet.messageType === ChatMessageTypeEnum.NORMAL,
        );

        expect(
            heard.map((packet) => packet.message),
            'the listener heard the line',
        ).to.include(`${SPEAKER} : hello there`);
        expect(heard[0].vid, 'the client needs the speaker vid to draw the bubble').to.equal(speakerVid);

        const echoed = chatPackets(speaker.received()).filter(
            (packet) => packet.messageType === ChatMessageTypeEnum.NORMAL,
        );
        expect(
            echoed.map((packet) => packet.message),
            'the speaker sees their own line',
        ).to.include(`${SPEAKER} : hello there`);
    });

    it('never puts a command on the wire', async () => {
        speaker.flush();
        listener.flush();

        speaker.command('/item 27001 1');
        await speaker.settle(600);

        const leaked = chatPackets(listener.received()).filter((packet) => packet.message.includes('/item'));

        expect(leaked, 'a command is not chat').to.deep.equal([]);
    });

    it('sends a shout to the empire with no speaker vid', async () => {
        speaker.flush();
        listener.flush();

        speaker.chat('trading here', ChatMessageTypeEnum.SHOUT);
        await speaker.settle(600);

        const shouts = chatPackets(listener.received()).filter(
            (packet) => packet.messageType === ChatMessageTypeEnum.SHOUT,
        );

        expect(shouts.map((packet) => packet.message)).to.include(`${SPEAKER} : trading here`);
        // A non-zero vid would make the client look the shouter up and discard
        // the line whenever it has no instance for them, which is the normal
        // case for a shout.
        expect(shouts[0].vid, 'a shout carries no vid').to.equal(0);
    });

    it('keeps the server up and leaks no rejection', async () => {
        expect(await harness.isServerAlive(), 'server still accepting connections').to.equal(true);
        expect(harness.capturedRejections(), 'no unhandled rejection escaped').to.deep.equal([]);
    });
});
