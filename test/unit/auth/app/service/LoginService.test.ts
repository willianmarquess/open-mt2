import { expect } from 'chai';
import sinon from 'sinon';
import LoginService from '@/auth/app/service/LoginService';
import Result from '@/core/domain/util/Result';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';

describe('LoginService', function () {
    let accountRepository, logger, cacheProvider, encryptionProvider, loginService;

    beforeEach(function () {
        accountRepository = {
            findByUsername: sinon.stub(),
        };
        logger = {
            info: sinon.spy(),
        };
        cacheProvider = {
            set: sinon.stub().resolves(),
        };
        encryptionProvider = {
            compare: sinon.stub(),
        };
        loginService = new LoginService({ accountRepository, logger, cacheProvider, encryptionProvider });
    });

    it('should return an error if username is not found', async function () {
        accountRepository.findByUsername.resolves(null);

        const result = await loginService.execute({ username: 'nonexistent', password: 'password' });

        expect(result).to.deep.equal(Result.error(ErrorTypesEnum.INVALID_USERNAME));
        expect(logger.info.calledOnce).to.be.true;
    });

    it('should return an error if password is invalid', async function () {
        const account = { getId: () => 1, getUsername: () => 'user', getPassword: () => 'hashedPassword' };
        accountRepository.findByUsername.resolves(account);
        encryptionProvider.compare.resolves(false);

        const result = await loginService.execute({ username: 'user', password: 'wrongPassword' });

        expect(result).to.deep.equal(Result.error(ErrorTypesEnum.INVALID_PASSWORD));
        expect(logger.info.calledOnce).to.be.true;
    });

    it('should return a key and cache the token if credentials are valid', async function () {
        const account = { getId: () => 1, getUsername: () => 'user', getPassword: () => 'hashedPassword' };
        accountRepository.findByUsername.resolves(account);
        encryptionProvider.compare.resolves(true);

        const result = await loginService.execute({ username: 'user', password: 'correctPassword' });

        expect(result).to.be.instanceOf(Result);
        expect(result.isOk()).to.be.true;
        expect(cacheProvider.set.calledOnce).to.be.true;
        expect(logger.info.notCalled).to.be.true;
    });
});
