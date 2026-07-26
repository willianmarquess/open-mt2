import { expect } from 'chai';
import sinon from 'sinon';
import Connection from '@/core/interface/networking/Connection';
import PingPacket from '@/core/interface/networking/packets/packet/out/PingPacket';

const logger: any = { info: () => {}, error: () => {}, debug: () => {} };

class TestConnection extends Connection {
    public readonly sentPackets: unknown[] = [];

    onHandshakeSuccess(): void {}

    send<T>(packet: T): void {
        this.sentPackets.push(packet);
    }
}

const KEEPALIVE_INTERVAL_MS = 60_000;

describe('Connection', () => {
    describe('keepalive', () => {
        let clock: sinon.SinonFakeTimers;
        let socket: any;
        let connection: TestConnection;

        beforeEach(() => {
            clock = sinon.useFakeTimers();
            socket = { destroy: sinon.spy() };
            connection = new TestConnection({ socket, logger });
        });

        afterEach(() => {
            connection.stopKeepalive();
            clock.restore();
        });

        it('should send a ping after each interval while the client answers', () => {
            connection.startKeepalive();

            clock.tick(KEEPALIVE_INTERVAL_MS);
            expect(connection.sentPackets).to.have.lengthOf(1);
            expect(connection.sentPackets[0]).to.be.instanceOf(PingPacket);

            connection.onPongReceived();
            clock.tick(KEEPALIVE_INTERVAL_MS);
            expect(connection.sentPackets).to.have.lengthOf(2);
            expect(socket.destroy.called).to.be.equal(false);
        });

        it('should close the connection when the client does not answer the ping', () => {
            connection.startKeepalive();

            clock.tick(KEEPALIVE_INTERVAL_MS);
            expect(connection.sentPackets).to.have.lengthOf(1);

            clock.tick(KEEPALIVE_INTERVAL_MS);
            expect(socket.destroy.called).to.be.equal(true);
            expect(connection.sentPackets).to.have.lengthOf(1);
        });

        it('should not ping anymore after stopKeepalive', () => {
            connection.startKeepalive();
            connection.stopKeepalive();

            clock.tick(KEEPALIVE_INTERVAL_MS * 3);
            expect(connection.sentPackets).to.have.lengthOf(0);
        });

        it('should not create a second timer if started twice', () => {
            connection.startKeepalive();
            connection.startKeepalive();

            clock.tick(KEEPALIVE_INTERVAL_MS);
            expect(connection.sentPackets).to.have.lengthOf(1);
        });

        it('should stop the keepalive when the connection is closed', () => {
            connection.startKeepalive();
            connection.close();

            clock.tick(KEEPALIVE_INTERVAL_MS * 2);
            expect(connection.sentPackets).to.have.lengthOf(0);
            expect(socket.destroy.called).to.be.equal(true);
        });
    });
});
