import { Module, Global } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { JobModule } from 'src/shared/job/job.module';

@Global()
@Module({
    imports: [JobModule],
    controllers: [BillingController],
    providers: [BillingService]
})
export class BillingModule {}
