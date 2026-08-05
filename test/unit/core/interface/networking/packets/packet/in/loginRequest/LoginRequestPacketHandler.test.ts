import { expect } from 'chai';
import sinon from 'sinon';
import LoginRequestPacketHandler from '@/core/interface/networking/packets/packet/in/loginRequest/LoginRequestPacketHandler';
import LoginFailedPacket from '@/core/interface/networking/packets/packet/out/LoginFailedPacket';
import LoginSuccessPacket from '@/core/interface/networking/packets/packet/out/LoginSuccessPacket';
import Result from '@/core/domain/util/Result';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';
import GameConnection from '@/game/interface/networking/GameConnection';

describe('LoginRequestPacketHandler', function () {
    let loginService: any;
    let logger: any;
    let connection: any;
    let handler: LoginRequestPacketHandler;

    const packet = (username = 'user', password = 'pass') =>
        ({
            isValid: () => true,
            getUsername: () => username,
            getPassword: () => password,
        }) as any;

    beforeEach(function () {
        loginService = { execute: sinon.stub() };
        logger = { info: sinon.spy(), error: sinon.spy() };
        connection = { send: sinon.spy(), close: sinon.spy() };
        handler = new LoginRequestPacketHandler({ loginService, logger });
    });

    it('should answer wrong credentials with WRONGPWD', async function () {
        loginService.execute.resolves(Result.error({ type: ErrorTypesEnum.INVALID_PASSWORD }));

        await handler.execute(connection as GameConnection, packet());

        expect(connection.send.calledOnce).to.be.true;
        const sent = connection.send.firstCall.args[0];
        expect(sent).to.be.instanceOf(LoginFailedPacket);
        expect(sent['status']).to.equal('WRONGPWD');
    });

    it('should answer a blocked account with its clientStatus string (issue #106)', async function () {
        loginService.execute.resolves(Result.error({ type: ErrorTypesEnum.LOGIN_NOT_ALLOWED, clientStatus: 'BLOCK' }));

        await handler.execute(connection as GameConnection, packet());

        expect(connection.send.calledOnce).to.be.true;
        const sent = connection.send.firstCall.args[0];
        expect(sent).to.be.instanceOf(LoginFailedPacket);
        expect(sent['status']).to.equal('BLOCK');
    });

    it('should clamp the status string to the wire limit of the failure packet', async function () {
        loginService.execute.resolves(
            Result.error({ type: ErrorTypesEnum.LOGIN_NOT_ALLOWED, clientStatus: 'BLOCKED_FOR_ABUSE' }),
        );

        await handler.execute(connection as GameConnection, packet());

        const sent = connection.send.firstCall.args[0];
        expect(sent['status'], 'ACCOUNT_STATUS_MAX_LEN is 8 in the client struct').to.equal('BLOCKED_');
    });

    it('should answer valid credentials with the session key', async function () {
        loginService.execute.resolves(Result.ok(1234));

        await handler.execute(connection as GameConnection, packet());

        expect(connection.send.calledOnce).to.be.true;
        expect(connection.send.firstCall.args[0]).to.be.instanceOf(LoginSuccessPacket);
    });
});
