import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { JobQueueService } from './job-queue.service';
import { EmailProcessor } from './email.processor';
import { MailerModule } from '../mailer/mailer.module';

@Module({
    imports: [MailerModule],
    providers: [JobQueueService, EmailProcessor],
    exports: [JobQueueService]
})
export class JobModule implements OnModuleInit, OnModuleDestroy {
    constructor(private readonly emailProcessor: EmailProcessor) {}

    async onModuleInit() {
        this.emailProcessor.start();
    }

    async onModuleDestroy() {
        await this.emailProcessor.stop();
    }
}
