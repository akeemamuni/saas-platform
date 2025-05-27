import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { PlanType, RegisterDTO } from './dto/register.dto';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { JwtModule } from 'src/shared/jwt/jwt.module';
import { CacheModule } from 'src/shared/cache/cache.module';
import { JobModule } from 'src/shared/job/job.module';
import { JobQueueService } from 'src/shared/job/job-queue.service';
import { resetTestDB, disconnectTestDB } from 'src/shared/utils/test-db.handler';

describe('Authentication service (integration)', () => {
    let module: TestingModule;
    let authService: AuthService;
    let jqService: JobQueueService;
    let prisma: PrismaService;
    let config: ConfigService;

    beforeAll(async () => {
        module = await Test.createTestingModule({
        imports: [
            ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env.test.local'
            }),
            AuthModule, PrismaModule,
            JwtModule, JobModule,
            CacheModule
        ]
       }).compile();

       authService = module.get(AuthService);
       jqService = module.get(JobQueueService);
       prisma = module.get(PrismaService);
       config = module.get(ConfigService);
    });

    beforeEach(async () => await resetTestDB());

    afterAll(async () => {
        await disconnectTestDB();
        await module.close();
        if (jqService) await jqService.close();
    });

    it('Services should be defined', () => {
        expect(authService).toBeDefined();
        expect(jqService).toBeDefined();
        expect(prisma).toBeDefined();
        expect(config).toBeDefined();
    });

    it('Register a new tenant and admin', async () => {
        const registerDto: RegisterDTO = {
            companyName: 'New Test Company',
            email: 'admin@newtestcom.com',
            password: config.get('PASSWORD') as string,
            plan: PlanType.BASIC
        };
        const admin = await authService.register(registerDto);
        expect(admin.email).toBe(registerDto.email);
    });

    it('Login a user', async () => {
        const loginDto: LoginDTO = {
            email: 'user@test.com',
            password: config.get('PASSWORD') as string
        };
        const tokens = await authService.login(loginDto);
        expect(tokens).not.toBeNull();
    });

    it('Refresh a user token', async () => {
        const loginDto: LoginDTO = {
            email: 'user@test.com',
            password: config.get('PASSWORD') as string
        };
        const tokens = await authService.login(loginDto);
        const refreshToken = await authService.refresh(tokens.refreshToken);
        expect(refreshToken).not.toBeNull();
    });
})
