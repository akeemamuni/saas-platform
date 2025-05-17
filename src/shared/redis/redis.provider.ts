// import { Injectable, Provider, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { Redis } from 'ioredis';

// // Option 1
// @Injectable()
// export class RedisProvider implements OnModuleInit, OnModuleDestroy {
//     private client: Redis;

//     constructor(private readonly config: ConfigService) {
//         const redisUrl = this.config.get<string>('REDIS_URL');
//         if (!redisUrl) throw new Error('Redis URL not found...');
//         this.client = new Redis(redisUrl);
//     }

//     onModuleInit() {
//         this.client.on('connect', () => console.log('Redis connected...'));
//         this.client.on('error', (err) => console.error('Redis error:', err));
//     }

//     async onModuleDestroy() {
//         await this.client?.quit();
//     }

//     getClient(): Redis {
//         return this.client;
//     }
// }

// // Option 2
// export const RedisClientProvider: Provider = {
//     provide: 'REDIS_CLIENT',
//     inject: [ConfigService],
//     useFactory: (configService: ConfigService) => {
//         const redisUrl = configService.get<string>('REDIS_URL');
//         if (!redisUrl) throw new Error('Redis URL not found...');

//         const client = new Redis(redisUrl);
//         client.on('connect', () => console.log('Redis connected...'));
//         client.on('error', (err) => console.error('Redis error:', err));

//         return client;
//     }
// };
