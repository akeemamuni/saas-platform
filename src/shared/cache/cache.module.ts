import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import redisStore from 'cache-manager-ioredis';

@Global()
@Module({
    imports: [
        NestCacheModule.registerAsync({
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                store: redisStore,
                host: config.get<string>('REDIS_HOST'),
                port: Number(config.get<string>('REDIS_PORT')),
                ttl: 120000,
                db: 0
            })
        })
    ],
    providers: [CacheService],
    exports: [CacheService]
})
export class CacheModule {}
