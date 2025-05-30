import { Module } from '@nestjs/common';
import { MyLoggerService, AppLoggerService } from './app-logger.service';

@Module({
  providers: [MyLoggerService, AppLoggerService]
})
export class AppLoggerModule {}
