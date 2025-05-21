import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtService } from 'src/shared/jwt/jwt.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CacheService } from 'src/shared/cache/cache.service';
import { JobQueueService } from 'src/shared/job/job-queue.service';

describe('Authentication service', () => {
    let jqService: JobQueueService;
    let authService: AuthService;
    let prisma: PrismaService;
    let config: ConfigService;
    let cache: CacheService;
    let jwt: JwtService;

    beforeEach(async () => {
       const module = await Test.createTestingModule({
        providers: [
            JwtService,
            AuthService,
            CacheService,
            JobQueueService,
            {
                provide: ConfigService,
                useValue: { get: jest.fn() }
            },
            {
                provide: PrismaService,
                useValue: {
                    user: { findUnique: jest.fn() },
                    plan: { findFirst: jest.fn() },
                    $transaction: jest.fn()
                }
            }
        ]
       }).compile();
    })
})
