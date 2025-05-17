import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}
    
    // Get cached data
    async getData<T>(key: string): Promise<T | null> {
        return this.cache.get<T>(key);
    }

    // Get hashed token
    async getHashedToken(key: string): Promise<string | null> {
        return this.cache.get(key);
    }

    // Add data to cache
    async setData<T>(key: string, value: T, ttl?: number): Promise<void> {
        if (ttl) {
            await this.cache.set(key, value, ttl);
        } else {
            await this.cache.set(key, value);
        }
    }

    // Add hashed token to cache
    async setHashedToken(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
            await this.cache.set(key, value, ttl);
        } else {
            await this.cache.set(key, value, 120000);
        }
    }

    // Delete data
    async deleteData(key:string): Promise<void> {
        await this.cache.del(key);
    }
}
