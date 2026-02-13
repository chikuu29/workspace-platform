import Dexie from 'dexie';

// Initialize Dexie database
const db = new Dexie('APICacheDB');
db.version(1).stores({
    cache: 'key, data, expiresAt'
});

interface CacheEntry {
    key: string;
    data: any;
    expiresAt: number;
}

// Save data to IndexedDB with expiration time
const saveToCache = async (key: string, data: any, ttl: number) => {
    const expiresAt = Date.now() + ttl * 1000; // Calculate expiration time
    await db.table<CacheEntry>('cache').put({ key, data, expiresAt });
};

// Get data from IndexedDB and check if it's still valid
const getFromCache = async (key: string) => {
    const cachedEntry:any = await db.table<CacheEntry>('cache').get(key);
    if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
        return cachedEntry.data;
    } else {
        return null;
    }
};

// Remove expired cache entries
const removeExpiredCache = async () => {
    const now = Date.now();
    await db.table<CacheEntry>('cache').where('expiresAt').below(now).delete();
};


export {saveToCache,getFromCache,removeExpiredCache}