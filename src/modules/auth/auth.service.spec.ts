import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtService } from '../../shared/jwt/jwt.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CacheService } from '../../shared/cache/cache.service';
import { JobQueueService } from '../../shared/job/job-queue.service';

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

       authService = module.get(AuthService);
    });

    it('Should be defined', () => expect(authService).toBeDefined());
})
