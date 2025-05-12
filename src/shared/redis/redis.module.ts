import { Module } from '@nestjs/common';
import { RedisClientProvider } from './redis.provider';

@Module({
  providers: [RedisClientProvider],
  exports: [RedisClientProvider]
})
export class RedisModule {}
