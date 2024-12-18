import { expect } from 'chai';
import Result from '../../../../src/core/app/Result';

describe('Result', () => {
    describe('Constructor', () => {
        it('should create an instance with data', () => {
            const result = new Result({ data: 'test data', error: null });
            expect(result.data).to.equal('test data');
            expect(result.error).to.be.null;
        });

        it('should create an instance with an error', () => {
            const result = new Result({ data: null, error: 'test error' });
            expect(result.data).to.be.null;
            expect(result.error).to.equal('test error');
        });
    });

    describe('Static methods', () => {
        it('should create an instance using ok method', () => {
            const result = Result.ok('test data');
            expect(result.data).to.equal('test data');
            expect(result.error).to.be.undefined;
        });

        it('should create an instance using error method', () => {
            const result = Result.error('test error');
            expect(result.data).to.be.undefined;
            expect(result.error).to.equal('test error');
        });
    });

    describe('Instance methods', () => {
        it('should return true for isOk when there is no error', () => {
            const result = new Result({ data: 'test data', error: null });
            expect(result.isOk()).to.be.true;
        });

        it('should return false for isOk when there is an error', () => {
            const result = new Result({ data: null, error: 'test error' });
            expect(result.isOk()).to.be.false;
        });

        it('should return true for hasError when there is an error', () => {
            const result = new Result({ data: null, error: 'test error' });
            expect(result.hasError()).to.be.true;
        });

        it('should return false for hasError when there is no error', () => {
            const result = new Result({ data: 'test data', error: null });
            expect(result.hasError()).to.be.false;
        });
    });
});
