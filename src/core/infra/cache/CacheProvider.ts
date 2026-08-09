export default interface CacheProvider {
    init(): Promise<void>;
    set(key: string, value: any, expirationInSec?: number): Promise<void>;
    get<T>(key: string): Promise<T>;
    take<T>(key: string): Promise<T | null>;
    delete(key: string): Promise<void>;
    close(): Promise<void>;
    exists(key: string): Promise<boolean>;
}
