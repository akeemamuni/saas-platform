import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';

@Global()
@Module({
    imports: [
        NestCacheModule.registerAsync({
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                stores: [createKeyv(config.get<string>('REDIS_URL'))],
                ttl: 60000,
            })
        })
    ],
    providers: [CacheService],
    exports: [CacheService]
})
export class CacheModule {}
