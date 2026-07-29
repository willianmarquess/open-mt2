import { expect } from 'chai';
import sinon from 'sinon';
import { EventEmitter } from 'node:events';
import Server from '@/core/interface/server/Server';
import Connection from '@/core/interface/networking/Connection';
import { makePackets } from '@/core/interface/networking/packets/Packets';
import BufferWriter from '@/core/interface/networking/buffer/BufferWriter';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import ShopPacket from '@/core/interface/networking/packets/packet/in/shop/ShopPacket';
import MyShopPacket from '@/core/interface/networking/packets/packet/in/myshop/MyShopPacket';
import EmpirePacket from '@/core/interface/networking/packets/packet/bidirectional/empire/EmpirePacket';
import { ShopSubHeaderCG } from '@/core/enum/ShopSubHeaderEnum';

const logger: any = { info: () => {}, error: () => {}, debug: () => {} };

class TestConnection extends Connection {
    onHandshakeSuccess(): void {}
    send(): void {}
}

class FrameRecorder extends Server {
    public readonly frames: Buffer[] = [];
    public lastConnection!: TestConnection;
    public onDataGate: Promise<void> | null = null;

    async onData(_connection: Connection, frame: Buffer) {
        this.frames.push(frame);
        if (this.onDataGate) await this.onDataGate;
    }

    createConnection(socket: any) {
        this.lastConnection = new TestConnection({ socket, logger });
        return this.lastConnection;
    }
}

const createFakeSocket = () => {
    const socket: any = new EventEmitter();
    socket.setNoDelay = () => {};
    socket.destroy = sinon.spy();
    return socket;
};

const settle = () => new Promise((resolve) => setImmediate(resolve));

/** Packets carry a trailing sequence byte on the wire, as the client sends them. */
const sequenced = (packet: Buffer) => Buffer.concat([packet, Buffer.of(0)]);

const attackPacket = () =>
    sequenced(
        new BufferWriter(PacketHeaderEnum.ATTACK, 8)
            .writeUint8(0)
            .writeUint32LE(1234)
            .writeUint8(0)
            .writeUint8(0)
            .getBuffer(),
    );

const chatPacket = (message: string) => {
    const size = 4 + message.length + 1;
    return sequenced(
        new BufferWriter(PacketHeaderEnum.CHAT_IN, size)
            .writeUint16LE(size)
            .writeUint8(0)
            .writeString(message, message.length + 1)
            .getBuffer(),
    );
};

describe('Server packet framing', () => {
    let server: FrameRecorder;
    let socket: any;

    beforeEach(() => {
        server = new FrameRecorder({ logger, config: {} as any, packets: makePackets() });
        socket = createFakeSocket();
        server.onListener(socket);
    });

    afterEach(() => {
        server.lastConnection?.stopKeepalive();
    });

    it('should process every packet when several arrive in one read', async () => {
        socket.emit('data', Buffer.concat([attackPacket(), chatPacket('hello'), attackPacket()]));
        await settle();

        expect(server.frames).to.have.lengthOf(3);
        expect(server.frames[0]).to.have.lengthOf(9);
        expect(server.frames[1]).to.have.lengthOf(4 + 'hello'.length + 2);
        expect(server.frames[2]).to.have.lengthOf(9);
    });

    it('should hold a partial packet until the rest of it arrives', async () => {
        const packet = chatPacket('split across reads');
        socket.emit('data', packet.subarray(0, 5));
        await settle();
        expect(server.frames).to.have.lengthOf(0);

        socket.emit('data', packet.subarray(5));
        await settle();
        expect(server.frames).to.have.lengthOf(1);
        expect(server.frames[0]).to.deep.equal(packet);
        expect(socket.destroy.called).to.be.equal(false);
    });

    it('should discard the buffer on an unknown header without closing the connection', async () => {
        socket.emit('data', Buffer.concat([attackPacket(), Buffer.from([0xee]), chatPacket('lost')]));
        await settle();

        expect(server.frames).to.have.lengthOf(1);
        expect(socket.destroy.called).to.be.equal(false);

        socket.emit('data', attackPacket());
        await settle();
        expect(server.frames).to.have.lengthOf(2);
    });

    it('should close the connection when a packet claims an absurd length', async () => {
        const lyingChat = sequenced(
            new BufferWriter(PacketHeaderEnum.CHAT_IN, 5).writeUint16LE(5000).writeUint8(0).getBuffer(),
        );
        socket.emit('data', lyingChat);
        await settle();

        expect(server.frames).to.have.lengthOf(0);
        expect(socket.destroy.called).to.be.equal(true);
    });

    it('should close the connection when the receive buffer overflows while a handler is busy', async () => {
        let release!: () => void;
        server.onDataGate = new Promise((resolve) => (release = resolve));

        socket.emit('data', attackPacket());
        await settle();
        expect(server.frames).to.have.lengthOf(1);

        socket.emit('data', Buffer.alloc(20_000, attackPacket()));
        await settle();
        expect(socket.destroy.called).to.be.equal(true);

        release();
        server.onDataGate = null;
    });

    it('should keep packets in arrival order while a handler is still awaiting', async () => {
        let release!: () => void;
        server.onDataGate = new Promise((resolve) => (release = resolve));

        socket.emit('data', chatPacket('first'));
        await settle();
        socket.emit('data', Buffer.concat([chatPacket('second'), chatPacket('third')]));
        await settle();
        expect(server.frames).to.have.lengthOf(1);

        server.onDataGate = null;
        release();
        await settle();

        expect(server.frames).to.have.lengthOf(3);
        expect(server.frames.map((f) => f.subarray(4, f.length - 2).toString('ascii'))).to.deep.equal([
            'first',
            'second',
            'third',
        ]);
    });

    it('should frame a login request at its struct size plus the sequence byte', async () => {
        const login = sequenced(
            new BufferWriter(PacketHeaderEnum.LOGIN_REQUEST, 65)
                .writeString('admin', 31)
                .writeString('admin', 17)
                .writeUint32LE(123)
                .getBuffer(),
        );
        socket.emit('data', login);
        await settle();

        expect(server.frames).to.have.lengthOf(1);
        expect(server.frames[0]).to.have.lengthOf(66);
    });
});

describe('Sequence byte exemptions', () => {
    // The client appends no sequence byte to these, so framing them one byte
    // too long stalls the connection waiting for a byte that never arrives.
    const exempt = [PacketHeaderEnum.HANDSHAKE, PacketHeaderEnum.PONG, PacketHeaderEnum.SERVER_STATUS_REQUEST];

    for (const header of exempt) {
        it(`should not add a sequence byte to header ${header}`, () => {
            const packet = makePackets().get(header)!.createPacket({ id: 0, time: 0, delta: 0 });

            expect(packet.getSequenceLength()).to.be.equal(0);
            expect(packet.getFrameLength(Buffer.alloc(64))).to.be.equal(packet.getSize());
        });
    }

    it('should add a sequence byte to a regular client packet', () => {
        const packet = makePackets().get(PacketHeaderEnum.ATTACK)!.createPacket({});

        expect(packet.getSequenceLength()).to.be.equal(1);
        expect(packet.getFrameLength(Buffer.alloc(64))).to.be.equal(packet.getSize() + 1);
    });
});

describe('Variable-length frame sizes', () => {
    it('should size a shop packet by its subheader', () => {
        const frameFor = (subHeader: number) => new ShopPacket().getFrameLength(Buffer.from([0x32, subHeader]));

        expect(frameFor(ShopSubHeaderCG.END)).to.be.equal(3);
        expect(frameFor(ShopSubHeaderCG.BUY)).to.be.equal(5);
        expect(frameFor(ShopSubHeaderCG.SELL)).to.be.equal(4);
        expect(frameFor(ShopSubHeaderCG.SELL2)).to.be.equal(5);
        expect(new ShopPacket().getFrameLength(Buffer.from([0x32]))).to.be.equal(null);
    });

    it('should frame an incoming empire packet by its inbound size plus the sequence byte', () => {
        expect(new EmpirePacket({ empireId: 1 }).getFrameLength()).to.be.equal(3);
    });

    it('should size a private-shop packet by its item count', () => {
        const withCount = (count: number) => {
            const buffer = Buffer.alloc(35);
            buffer[0] = 0x37;
            buffer[34] = count;
            return new MyShopPacket().getFrameLength(buffer);
        };

        expect(withCount(0)).to.be.equal(36);
        expect(withCount(3)).to.be.equal(36 + 3 * 13);
        expect(new MyShopPacket().getFrameLength(Buffer.alloc(10))).to.be.equal(null);
    });
});
