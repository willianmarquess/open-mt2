import { expect } from 'chai';
import sinon from 'sinon';
import LoginService from '@/auth/app/service/LoginService';
import Result from '@/core/domain/util/Result';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';

describe('LoginService', function () {
    let accountRepository: any;
    let logger: any;
    let cacheProvider: any;
    let encryptionProvider: any;
    let loginService: LoginService;

    beforeEach(function () {
        accountRepository = {
            findByUsername: sinon.stub(),
        };
        logger = {
            info: sinon.spy(),
            error: sinon.spy(),
            debug: sinon.spy(),
        };
        cacheProvider = {
            init: sinon.stub().resolves(),
            set: sinon.stub().resolves(),
            get: sinon.stub().resolves(),
            delete: sinon.stub().resolves(),
            close: sinon.stub().resolves(),
            exists: sinon.stub().resolves(false),
        };
        encryptionProvider = {
            hash: sinon.stub().resolves('hashed'),
            compare: sinon.stub(),
        };
        loginService = new LoginService({ accountRepository, logger, cacheProvider, encryptionProvider });
    });

    const createAccount = ({ allowLogin = true, clientStatus = 'OK' } = {}) => ({
        id: 1,
        getId: () => 1,
        getUsername: () => 'user',
        getPassword: () => 'hashedPassword',
        getAccountStatus: () => ({
            getAllowLogin: () => allowLogin,
            getClientStatus: () => clientStatus,
        }),
    });

    it('should return an error if username is not found', async function () {
        accountRepository.findByUsername.resolves(null);

        const result = await loginService.execute({ username: 'nonexistent', password: 'password' });

        expect(result).to.deep.equal(Result.error({ type: ErrorTypesEnum.INVALID_USERNAME }));
        expect(logger.info.calledOnce).to.be.true;
    });

    it('should return an error if password is invalid', async function () {
        accountRepository.findByUsername.resolves(createAccount());
        encryptionProvider.compare.resolves(false);

        const result = await loginService.execute({ username: 'user', password: 'wrongPassword' });

        expect(result).to.deep.equal(Result.error({ type: ErrorTypesEnum.INVALID_PASSWORD }));
        expect(logger.info.calledOnce).to.be.true;
    });

    it('should refuse a login the account status does not allow (issue #106)', async function () {
        accountRepository.findByUsername.resolves(createAccount({ allowLogin: false, clientStatus: 'BLOCK' }));
        encryptionProvider.compare.resolves(true);

        const result = await loginService.execute({ username: 'user', password: 'correctPassword' });

        expect(result).to.deep.equal(Result.error({ type: ErrorTypesEnum.LOGIN_NOT_ALLOWED, clientStatus: 'BLOCK' }));
        expect(cacheProvider.set.notCalled, 'no session token is minted for a blocked account').to.be.true;
        expect(logger.info.calledOnce).to.be.true;
    });

    it('should return a key and cache the token if credentials are valid', async function () {
        accountRepository.findByUsername.resolves(createAccount());
        encryptionProvider.compare.resolves(true);

        const result = await loginService.execute({ username: 'user', password: 'correctPassword' });

        expect(result).to.be.instanceOf(Result);
        expect(result.isOk()).to.be.true;
        expect(cacheProvider.set.calledOnce).to.be.true;
        expect(logger.info.notCalled).to.be.true;
    });
});
