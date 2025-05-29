import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user.module';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { LoginDTO } from '../auth/dto/login.dto';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { JwtModule } from 'src/shared/jwt/jwt.module';
import { JwtService } from 'src/shared/jwt/jwt.service';
import { CacheModule } from 'src/shared/cache/cache.module';
import { RoleType } from '@prisma/client';
import { JwtPayload } from 'src/shared/types/payload.type';

describe('User service (integration)', () => {
    let module: TestingModule;
    let authService: AuthService;
    let userService: UserService;
    let prisma: PrismaService;
    let config: ConfigService;
    let jwt: JwtService;
    let adminUser: JwtPayload;

    beforeAll(async () => {
        module = await Test.createTestingModule({
        imports: [
            ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env.test.local'
            }),
            AuthModule, UserModule, PrismaModule, 
            JwtModule, CacheModule
        ]
       }).compile();

       authService = module.get(AuthService);
       userService = module.get(UserService);
       prisma = module.get(PrismaService);
       config = module.get(ConfigService);
       jwt = module.get(JwtService);
    });

    afterAll(async () => {
        await prisma.$disconnect();
        await module.close();
    });

    it('Signin admin user', async () => {
        const loginDto: LoginDTO = {
            email: 'john.d@seed.com',
            password: config.get('PASSWORD') as string
        };
        const tokens = await authService.login(loginDto);
        adminUser = await jwt.verifyToken(tokens.accessToken);
        expect(adminUser.email).toBe(loginDto.email);
    });

    it('Create new tenant user', async () => {
        const password = config.get('PASSWORD') as string;
        const createUserDto: CreateUserDto = {
            name: 'Chris Oneil',
            email: 'chris.o@test.com',
            role: RoleType.MEMBER,
            password
        }
        const newUser = await userService.createTenantUser(adminUser, createUserDto);
        expect(newUser.tenantId).toBe(adminUser.tenantId);
        expect(newUser.email).toBe(createUserDto.email);
    });

    it('Get all tenant users', async () => {
        const allTenantUsers = await userService.getTenantUsers(adminUser);
        expect(allTenantUsers.length).toBe(2);
    });
})
