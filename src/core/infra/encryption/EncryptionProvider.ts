export interface EncryptionProvider {
    hash(value: string): Promise<string>;
    compare(value: string, encrypted: string): Promise<boolean>;
}
