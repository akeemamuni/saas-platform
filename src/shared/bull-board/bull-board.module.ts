import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { JobQueueService } from '../job/job-queue.service';
import express from 'express';
import basicAuth from 'express-basic-auth';

@Module({})
export class BullBoardModule implements OnModuleInit {
    private readonly queueDashboard = express();

    constructor(
        private readonly jqService: JobQueueService,
        private readonly config: ConfigService,
        private readonly password: string,
        private port: string | undefined
    ) {
        this.port = this.config.get<string>('EXP_PORT');
        this.password = this.config.get<string>('EXP_PASSWORD') as string;
        if (!port || !password) throw new Error('Queue dashboard credentials not found...');
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
        this.queueDashboard.listen(this.port, () => {
            console.log(`Queue board running on :${this.port}/queues`);
        });
    }
}
