import Result from '@/core/app/Result';
import { expect } from 'chai';

describe('Result', () => {
    describe('Static methods', () => {
        it('should create an instance using ok method', () => {
            const result = Result.ok('test data');
            expect(result.getData()).to.equal('test data');
            expect(result.getError()).to.be.undefined;
        });

        it('should create an instance using error method', () => {
            const result = Result.error('test error');
            expect(result.getData()).to.be.undefined;
            expect(result.getError()).to.equal('test error');
        });
    });
});
