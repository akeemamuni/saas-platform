import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}
    
    // Get cached data
    async get<T>(key: string): Promise<T | null> {
        return this.cache.get(key);
    }

    // Get hashed token
    // async getHashedToken(key: string): Promise<string | null> {
    //     return this.cache.get(key);
    // }

    // Add data to cache
    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        if (ttl) {
            await this.cache.set(key, value, ttl);
        } else {
            await this.cache.set(key, value);
        }
    }

    // Add hashed token to cache
    // async setHashedToken(key: string, value: string, ttl?: number): Promise<void> {
    //     if (ttl) {
    //         await this.cache.set(key, value, ttl);
    //     } else {
    //         await this.cache.set(key, value);
    //     }
    // }

    // Delete data
    async deleteData(key:string): Promise<void> {
        await this.cache.del(key);
    }
}
