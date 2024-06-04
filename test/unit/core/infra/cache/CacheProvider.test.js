import { expect } from 'chai';
import sinon from 'sinon';
import { createClient } from 'redis';
import CacheProvider from '../../../../../src/core/infra/cache/CacheProvider.js';

describe('CacheProvider', () => {
    let logger;
    let config;
    let redisClient;
    let cacheProvider;

    beforeEach(() => {
        logger = {
            info: sinon.stub(),
            error: sinon.stub(),
        };
        config = {
            CACHE_HOST: 'localhost',
            CACHE_PORT: 6379,
            CACHE_PING_INTERVAL: 1000,
        };
        redisClient = {
            connect: sinon.stub().resolves(),
            on: sinon.stub(),
            set: sinon.stub().resolves(),
            get: sinon.stub().resolves(),
            del: sinon.stub().resolves(),
            quit: sinon.stub().resolves(),
            expire: sinon.stub().resolves(),
            exists: sinon.stub().resolves(),
        };
        sinon.stub(createClient).returns(redisClient);
        cacheProvider = new CacheProvider({ logger, config });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should initialize the client and log success', async () => {
        await cacheProvider.init();
        expect(redisClient.connect.calledOnce).to.be.true;
        expect(redisClient.on.calledWith('error')).to.be.true;
        expect(logger.info.calledWith('[CACHE] Connected with success.')).to.be.true;
    });

    it('should log an error when there is a connection error', async () => {
        const error = new Error('Connection error');
        await cacheProvider.init();
        const errorHandler = redisClient.on.getCall(0).args[1];
        errorHandler(error);
        expect(logger.error.calledWith('[CACHE] Connection error: ', error)).to.be.true;
    });

    it('should set a value with an expiration', async () => {
        await cacheProvider.set('key', 'value', 60);
        expect(redisClient.set.calledWith('key', 'value')).to.be.true;
        expect(redisClient.expire.calledWith('key', 60)).to.be.true;
    });

    it('should set a value without an expiration', async () => {
        await cacheProvider.set('key', 'value');
        expect(redisClient.set.calledWith('key', 'value')).to.be.true;
        expect(redisClient.expire.called).to.be.false;
    });

    it('should get a value', async () => {
        redisClient.get.resolves('value');
        const value = await cacheProvider.get('key');
        expect(redisClient.get.calledWith('key')).to.be.true;
        expect(value).to.equal('value');
    });

    it('should delete a value', async () => {
        await cacheProvider.delete('key');
        expect(redisClient.del.calledWith('key')).to.be.true;
    });

    it('should close the connection', async () => {
        await cacheProvider.close();
        expect(redisClient.quit.calledOnce).to.be.true;
    });

    it('should check if a key exists', async () => {
        redisClient.exists.resolves(1);
        const exists = await cacheProvider.exists('key');
        expect(redisClient.exists.calledWith('key')).to.be.true;
        expect(exists).to.equal(1);
    });
});
