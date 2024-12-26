import { expect } from 'chai';
import sinon from 'sinon';
import SelectEmpireService from '@/game/app/service/SelectEmpireService';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';
import CacheKeyGenerator from '@/core/util/CacheKeyGenerator';

describe('SelectEmpireService', () => {
    let selectEmpireService: SelectEmpireService;
    let loggerStub;
    let cacheProviderStub;

    beforeEach(() => {
        loggerStub = {
            info: sinon.stub(),
        };
        cacheProviderStub = {
            set: sinon.stub(),
        };

        selectEmpireService = new SelectEmpireService({
            logger: loggerStub,
            cacheProvider: cacheProviderStub,
        });
    });

    it('should return INVALID_EMPIRE error if empireId is invalid', async () => {
        const result = await selectEmpireService.execute(0, 123);

        expect(result.hasError()).to.be.true;
        expect(result.getError()).to.equal(ErrorTypesEnum.INVALID_EMPIRE);
        expect(loggerStub.info.calledOnce).to.be.true;
    });

    it('should set empireId in cache if empireId is valid', async () => {
        const accountId = 123;
        const empireId = 2;
        const key = CacheKeyGenerator.createEmpireKey(accountId);
        cacheProviderStub.set.resolves();

        const result = await selectEmpireService.execute(empireId, accountId);

        expect(result.isOk()).to.be.true;
        expect(cacheProviderStub.set.calledOnceWith(key, empireId)).to.be.true;
    });
});
