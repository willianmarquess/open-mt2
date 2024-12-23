import { expect } from 'chai';
import sinon from 'sinon';
import bcryptjs from 'bcryptjs';
import BcryptEncryptionProvider from '@/core/infra/encryption/BcryptEncryptionProvider';

describe('EncryptionProvider', () => {
    let encryptionProvider: BcryptEncryptionProvider;
    let hashStub;
    let compareStub;

    beforeEach(() => {
        encryptionProvider = new BcryptEncryptionProvider();
        hashStub = sinon.stub(bcryptjs, 'hash');
        compareStub = sinon.stub(bcryptjs, 'compare');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('hash', () => {
        it('should hash the value with bcryptjs', async () => {
            const value = 'testValue';
            const hashedValue = 'hashedValue';
            hashStub.resolves(hashedValue);

            const result = await encryptionProvider.hash(value);

            expect(hashStub.calledWith(value, 5)).to.be.true;
            expect(result).to.equal(hashedValue);
        });
    });

    describe('compare', () => {
        it('should compare the value with the encrypted value using bcryptjs', async () => {
            const value = 'testValue';
            const encrypted = 'hashedValue';
            compareStub.resolves(true);

            const result = await encryptionProvider.compare(value, encrypted);

            expect(compareStub.calledWith(value, encrypted)).to.be.true;
            expect(result).to.be.true;
        });

        it('should return false when the comparison fails', async () => {
            const value = 'testValue';
            const encrypted = 'hashedValue';
            compareStub.resolves(false);

            const result = await encryptionProvider.compare(value, encrypted);

            expect(compareStub.calledWith(value, encrypted)).to.be.true;
            expect(result).to.be.false;
        });
    });
});
