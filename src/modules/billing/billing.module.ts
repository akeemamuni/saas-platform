import { Module, Global } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';

@Global()
@Module({
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
