import { expect } from 'chai';
import sinon from 'sinon';
import GameConnection from '@/game/interface/networking/GameConnection';
import PingPacket from '@/core/interface/networking/packets/packet/out/PingPacket';

type LogLine = { level: string; message: string };

const createLogger = (logged: Array<LogLine>): any => ({
    info: (message: string) => logged.push({ level: 'info', message }),
    error: (message: string) => logged.push({ level: 'error', message }),
    debug: (message: string) => logged.push({ level: 'debug', message }),
});

describe('GameConnection outgoing packet log (issue #219)', () => {
    let logged: Array<LogLine>;
    let socket: any;
    let connection: GameConnection;

    beforeEach(() => {
        logged = [];
        socket = { write: sinon.spy(), destroy: sinon.spy(), setNoDelay: () => {} };
        connection = new GameConnection({ socket, logger: createLogger(logged) });
    });

    afterEach(() => {
        connection.stopKeepalive();
    });

    it('names every packet it puts on the wire, the way the auth server already does', () => {
        connection.send(new PingPacket());

        const out = logged.filter((line) => line.message.includes('[OUT][PACKET]'));
        expect(out, 'the send must leave a record').to.have.lengthOf(1);
        expect(out[0].level).to.be.equal('debug');
        expect(out[0].message).to.be.equal('[OUT][PACKET] name: PingPacket');
    });

    it('still writes the packed buffer', () => {
        connection.send(new PingPacket());

        expect(socket.write.calledOnce).to.be.equal(true);
        expect(socket.write.firstCall.args[0]).to.be.instanceOf(Buffer);
    });

    it('logs one line per packet, in send order', () => {
        connection.send(new PingPacket());
        connection.send(new PingPacket());

        const out = logged.filter((line) => line.message.includes('[OUT][PACKET]'));
        expect(out).to.have.lengthOf(2);
        expect(socket.write.callCount).to.be.equal(2);
    });
});
