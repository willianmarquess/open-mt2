import bcrypt from 'bcrypt';

const SAULT_ROUNDS = 5;

export default class EncryptionProvider {
    async hash(value) {
        return bcrypt.hash(value, SAULT_ROUNDS);
    }

    async compare(value, encrypted) {
        return bcrypt.compare(value, encrypted);
    }
}
