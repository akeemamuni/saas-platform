import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Worker, Job } from "bullmq";
import { welcomeEmail } from "./jobs/welcome-email.job";
import { passwordResetEmail } from "./jobs/password-reset.job";
import { stripePaymentSuccess } from "./jobs/stripe-success.job";
import { stripePaymentCancelled } from "./jobs/stripe-cancelled.job";
import { MailerService } from "../mailer/mailer.service";

@Injectable()
export class EmailProcessor {
    private worker: Worker;
    private readonly redisHost: string;
    private readonly redisPort: number;

    constructor(
        private readonly config: ConfigService,
        private readonly mailer: MailerService
    ) {
        this.redisHost = this.config.get('REDIS_HOST') as string;
        this.redisPort = Number(this.config.get('REDIS_PORT'));

        if (!this.redisHost || !this.redisPort) {
            throw new Error('Redis host and/or port not found...');
        }
    }

    // Job processor
    async handleJob(job: Job) {
        switch(job.name) {
            case 'send-welcome-email': return welcomeEmail(job.data, this.mailer);
            case 'password-reset-email': return passwordResetEmail(job.data, this.mailer);
            case 'stripe-payment-success': return stripePaymentSuccess(job.data);
            case 'stripe-payment-cancelled': return stripePaymentCancelled(job.data);
            default: console.log(`Unhandled job: ${job.name}`);
        }
    }

    // Start worker and process jobs
    async start() {
        try {
            this.worker = new Worker(
                'email', async (job: Job) => this.handleJob(job),
                {connection: {host: this.redisHost, port: this.redisPort}}
            );
        } catch (error) {
            throw error;
        }

        this.worker.on('completed', (job) => {
            console.log(`Job ${job.name} completed`);
        });

        this.worker.on('failed', (job, err) => {
            console.error(
                `${job?.name} failed after ${job?.attemptsMade}/${job?.opts.attempts}:`, err
            );
        });
    }

    // Graceful shutdown
    async stop() {
        await this.worker?.close();
    }
}
