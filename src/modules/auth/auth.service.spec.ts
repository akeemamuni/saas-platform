import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { PlanType, RegisterDTO } from './dto/register.dto';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { JwtModule } from 'src/shared/jwt/jwt.module';
import { CacheModule } from 'src/shared/cache/cache.module';
import { JobModule } from 'src/shared/job/job.module';
import { RoleType } from '@prisma/client';

describe('Authentication service (integration)', () => {
    let authService: AuthService;
    let prisma: PrismaService;

    beforeAll(async () => {
       const module = await Test.createTestingModule({
        imports: [
            ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env.test.local'
            }),
            AuthModule,
            PrismaModule,
            JwtModule,
            JobModule,
            CacheModule
        ]
       }).compile();

       authService = module.get(AuthService);
       prisma = module.get(PrismaService);
    });

    beforeEach(async () => {
        // Clear tables
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User", "Tenant", "Role", "Plan", "Subscription" RESTART IDENTITY CASCADE`);
        // Seed default role and plan
        await Promise.all([
            prisma.role.upsert({
                where: { name: RoleType.ADMIN },
                update: {},
                create: { name: RoleType.ADMIN }
            }),
            prisma.role.upsert({
                where: { name: RoleType.MANAGER },
                update: {},
                create: { name: RoleType.MANAGER }
            }),
            prisma.role.upsert({
                where: { name: RoleType.MEMBER },
                update: {},
                create: { name: RoleType.MEMBER }
            })
        ]);
        await Promise.all([
            prisma.plan.create({
                data: {
                    name: 'Basic',
                    priceInCents: 9900,
                    maxUsers: 5,
                },
            }),
            prisma.plan.create({
                data: {
                    name: 'Pro',
                    priceInCents: 19900,
                    maxUsers: 12,
                    stripePriceId: process.env.PRO_PRICE_ID
                },
            }),
            prisma.plan.create({
                data: {
                    name: 'Gold',
                    priceInCents: 29900,
                    maxUsers: 20,
                    stripePriceId: process.env.GOLD_PRICE_ID
                },
            }),
        ]);
    });
    
    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('AuthService should be defined', () => expect(authService).toBeDefined());

    it('PrismaService should be defined', () => expect(prisma).toBeDefined());

    it('Register a new user and tenant', async () => {
        const registerDto: RegisterDTO = {
            companyName: 'Test Company',
            email: 'admin@example.com',
            password: 'password1234',
            plan: PlanType.BASIC
        };

        const newUser = await authService.register(registerDto);
        expect(newUser.email).toBe(registerDto.email);
    });
})
