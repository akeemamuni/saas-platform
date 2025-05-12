import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

// All job queues
@Injectable()
export class JobQueueService {
    private readonly emailQueue: Queue;

    constructor(private readonly config: ConfigService) {
        const redisUrl = this.config.get<string>('REDIS_URL');
        if (!redisUrl) throw new Error('Redis URL not defined...');
        this.emailQueue = new Queue('email', { connection: { host: redisUrl } });
    }

    // Add welcome email job to queue
    async welcomeEmailJob(data: { email: string; name: string }) {
        await this.emailQueue.add('send-welcome-email', data);
    }
}
