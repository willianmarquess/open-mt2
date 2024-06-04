import { expect } from 'chai';
import Ip from '../../../../src/core/util/Ip.js';

describe('Ip', () => {
    describe('toInt', () => {
        it('should convert IP address "0.0.0.0" to integer 0', () => {
            const result = Ip.toInt('0.0.0.0');
            expect(result).to.equal(0);
        });

        it('should convert IP address "127.0.0.1" to integer 2130706433', () => {
            const result = Ip.toInt('127.0.0.1');
            expect(result).to.equal(2130706433);
        });

        it('should convert IP address "192.168.0.1" to integer 3232235521', () => {
            const result = Ip.toInt('192.168.0.1');
            expect(result).to.equal(3232235521);
        });

        it('should convert IP address "255.255.255.255" to integer 4294967295', () => {
            const result = Ip.toInt('255.255.255.255');
            expect(result).to.equal(4294967295);
        });

        it('should handle single-digit IP parts correctly', () => {
            const result = Ip.toInt('1.1.1.1');
            expect(result).to.equal(16843009);
        });
    });
});
