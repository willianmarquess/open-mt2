import { expect } from 'chai';
import sinon from 'sinon';
import winston from 'winston';
import WinstonLoggerAdapter from '@/core/infra/logger/WinstonLoggerAdapter';

describe('WinstonLoggerAdapter', () => {
    let winstonLoggerAdapter: WinstonLoggerAdapter;
    let loggerStub;

    beforeEach(() => {
        loggerStub = {
            info: sinon.stub(),
            error: sinon.stub(),
            debug: sinon.stub(),
        };

        sinon.stub(winston, 'createLogger').returns(loggerStub);

        winstonLoggerAdapter = new WinstonLoggerAdapter();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should log info messages', () => {
        const message = 'Info message';
        const params = { key: 'value' };

        winstonLoggerAdapter.info(message, params);

        expect(loggerStub.info.calledOnce).to.be.true;
        expect(loggerStub.info.calledWith(message, [params])).to.have.true;
    });

    it('should log error messages with string', () => {
        const message = 'Error message';
        const params = { key: 'value' };

        winstonLoggerAdapter.error(message, params);

        expect(loggerStub.error.calledOnce).to.be.true;
        expect(loggerStub.error.calledWith(message, [params])).to.be.true;
    });

    it('should log error messages with Error object', () => {
        const error = new Error('Error message');
        const params = { key: 'value' };

        winstonLoggerAdapter.error(error, params);

        expect(loggerStub.error.calledOnce).to.be.true;
        expect(loggerStub.error.calledWith(error)).to.be.true;
    });

    it('should log debug messages', () => {
        const message = 'Debug message';
        const params = { key: 'value' };

        winstonLoggerAdapter.debug(message, params);

        expect(loggerStub.debug.calledOnce).to.be.true;
        expect(loggerStub.debug.calledWith(message, [params])).to.be.true;
    });
});
