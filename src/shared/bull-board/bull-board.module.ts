import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { JobModule } from '../job/job.module';
import { JobQueueService } from '../job/job-queue.service';
import { Server } from 'http';
import { promisify } from 'util';
import express from 'express';
import basicAuth from 'express-basic-auth';

@Module({imports: [JobModule]})
export class BullBoardModule implements OnModuleInit, OnModuleDestroy {
    private readonly queueDashboard = express();
    private port: string | undefined;
    private password: string;
    private server: Server;

    constructor(
        private readonly jqService: JobQueueService,
        private readonly config: ConfigService,
    ) {
        this.port = this.config.get<string>('EXP_PORT');
        this.password = this.config.get<string>('EXP_PASSWORD') as string;
        if (!this.port || !this.password) throw new Error('Queue dashboard credentials not found...');
    }

    onModuleInit() {
        const emailQueue = this.jqService.getEmailQueue();
        const serverAdapter = new ExpressAdapter();
        serverAdapter.setBasePath('/queues');

        createBullBoard({
            // Many queues can be added to list
            queues: [new BullMQAdapter(emailQueue)],
            serverAdapter
        });

        // Dashboard middleware
        this.queueDashboard.use('/queues', 
            basicAuth({users: {admin: this.password}, challenge: true}), 
            serverAdapter.getRouter()
        );
        this.server = this.queueDashboard.listen(this.port, () => {
            console.log(`Queue board running on :${this.port}/queues`);
        });
    }

    async onModuleDestroy() {
        if (this.server) {
            const closeServer = promisify(this.server.close).bind(this.server);
            await closeServer();
            // console.log('Queue dashboard server closed...');
        }
    }
}
