import Dexie, { Table } from 'dexie';

interface CacheEntry<T = unknown> {
    key: string;
    data: T;
    expiresAt: number;
}

class APICacheDB extends Dexie {
    cache!: Table<CacheEntry, string>;

    constructor() {
        super('APICacheDB');
        this.version(1).stores({
            cache: 'key, expiresAt',
        });
    }
}

const db = new APICacheDB();

const saveToCache = async <T = unknown>(key: string, data: T, ttlSeconds: number): Promise<void> => {
    const safeTTL = Math.max(0, ttlSeconds);
    const expiresAt = Date.now() + safeTTL * 1000;
    await db.cache.put({ key, data, expiresAt });
};

const getFromCache = async <T = unknown>(key: string): Promise<T | null> => {
    const cachedEntry = await db.cache.get(key);

    if (!cachedEntry) return null;

    if (cachedEntry.expiresAt <= Date.now()) {
        await db.cache.delete(key);
        return null;
    }

    return cachedEntry.data as T;
};

const removeExpiredCache = async (): Promise<void> => {
    const now = Date.now();
    await db.cache.where('expiresAt').belowOrEqual(now).delete();
};

const clearCache = async (): Promise<void> => {
    await db.cache.clear();
};

export { saveToCache, getFromCache, removeExpiredCache, clearCache };
