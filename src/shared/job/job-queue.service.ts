import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

// All job queues
@Injectable()
export class JobQueueService {
    private readonly emailQueue: Queue;

    constructor(private readonly config: ConfigService) {
        const redisHost = this.config.get<string>('REDIS_HOST');
        const redisPort = this.config.get<string>('REDIS_PORT');
        if (!redisHost || !redisPort) throw new Error('Redis URL not defined...');
        this.emailQueue = new Queue('email', {
            connection: { host: redisHost, port: parseInt(redisPort) }
        });
    }

    // Add welcome email job to queue
    async welcomeEmailJob(data: { email: string; name: string }) {
        await this.emailQueue.add('send-welcome-email', data);
    }

    // Add password reset to queue
    async passwordResetEmailJob(email: string) {
        await this.emailQueue.add('password-reset-email', email);
    }

    // Add stripe subscription success
    async stripePaymentSuccessJob(tenantId: string) {
        await this.emailQueue.add('stripe-payment-success', tenantId);
    }

    // Add stripe subscription cancelled
    async stripePaymentCancelledJob(data: {tenantId: string, subId: string | null}) {
        await this.emailQueue.add('stripe-payment-cancelled', data);
    }
}
