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

describe('Authentication service (integration)', () => {
    let module: TestingModule;
    let authService: AuthService;
    let jqService: JobQueueService;
    let prisma: PrismaService;
    let config: ConfigService;
    let tokens: { accessToken: string, refreshToken: string };

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

    afterAll(async () => {
        await prisma.$disconnect();
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

    it('Login user', async () => {
        const loginDto: LoginDTO = {
            email: 'admin@newtestcom.com',
            password: config.get('PASSWORD') as string
        };
        tokens = await authService.login(loginDto);
        expect(tokens.accessToken).not.toBeNull();
        expect(tokens.refreshToken).not.toBeNull();
    });

    it('Refresh user token', async () => {
        const newTokens = await authService.refresh(tokens.refreshToken);
        expect(newTokens.accessToken).not.toBeNull();
        expect(newTokens.refreshToken).not.toBeNull();
    });
})
