import bcrypt from 'bcryptjs';
import { EncryptionProvider } from '@/core/infra/encryption/EncryptionProvider';

const SAULT_ROUNDS = 5;

export default class BcryptEncryptionProvider implements EncryptionProvider {
    async hash(value: string): Promise<string> {
        return bcrypt.hash(value, SAULT_ROUNDS);
    }

    async compare(value: string, encrypted: string): Promise<boolean> {
        return bcrypt.compare(value, encrypted);
    }
}
