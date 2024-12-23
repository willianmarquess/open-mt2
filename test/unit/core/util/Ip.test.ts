import Ip from '@/core/util/Ip';
import { expect } from 'chai';

describe('Ip', () => {
    describe('toInt', () => {
        it('should convert IP address "0.0.0.0" to integer 0', () => {
            const result = Ip.toInt('0.0.0.0');
            expect(result).to.equal(0);
        });

        it('should convert IP address "127.0.0.1" to integer 16777343', () => {
            const result = Ip.toInt('127.0.0.1');
            expect(result).to.equal(16777343);
        });

        it('should convert IP address "192.168.0.1" to integer 16820416', () => {
            const result = Ip.toInt('192.168.0.1');
            expect(result).to.equal(16820416);
        });

        it('should convert IP address "255.255.255.255" to integer -1', () => {
            const result = Ip.toInt('255.255.255.255');
            expect(result).to.equal(-1);
        });

        it('should handle single-digit IP parts correctly', () => {
            const result = Ip.toInt('1.1.1.1');
            expect(result).to.equal(16843009);
        });
    });
});
