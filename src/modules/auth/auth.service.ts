import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { hashValue, verifyValue } from 'src/shared/utils/hash.util';
import { SubscriptionStatus, RoleType } from '@prisma/client';
import { JwtService } from 'src/shared/jwt/jwt.service';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ResponseDTO } from './dto/response.dto';
import { JwtPayload } from 'src/shared/types/payload.type';
import { JwtPayloadDTO } from './dto/jwt-payload.dto';
import { JobQueueService } from 'src/shared/job/job-queue.service';
import { CacheService } from 'src/shared/cache/cache.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly jqService: JobQueueService,
        private readonly prisma: PrismaService,
        private readonly cache: CacheService,
        private readonly jwt: JwtService
    ) {}

    private async genAccessAndRefreshToken(jwtPayload: JwtPayload) {
        // Payload has to be sanitized
        const instance = plainToInstance(
            JwtPayloadDTO,
            instanceToPlain(jwtPayload),
            {
                excludeExtraneousValues: true
            }
        );
        const plainPayloadObj = instanceToPlain(instance);
        
        // Create access/refresh token
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.genAccessToken(plainPayloadObj),
            this.jwt.genRefreshToken(plainPayloadObj)
        ]);

        // Hash and store refresh token
        const hashedToken = await hashValue(refreshToken);
        await this.cache.set(plainPayloadObj.id, hashedToken, 1000*60*60*24*7);

        // await this.prisma.user.update({
        //     where: {id: plainPayloadObj.id},
        //     data: { hashedToken }
        // });

        return { accessToken, refreshToken };
    }

    async register(payload: RegisterDTO) {
        // const token = this.configService.get<string>('JWT_SECRET');
        const { companyName, adminName, email, password } = payload;
        // Find new tenant selected plan
        const defaultPlan = await this.prisma.plan.findFirst({ where: { name: 'Basic' } });
        if (!defaultPlan) throw new Error('Default plan not found..');
        // Hash password
        const hashedPassword = await hashValue(password);

        try {
            const txResult = await this.prisma.$transaction(
                async (tx) => {
                    // Create new tenant (company)
                    const newTenant = await tx.tenant.create({
                        data: {
                            name: companyName,
                            subscription: {
                                create: {
                                    planId: defaultPlan.id,
                                    status: SubscriptionStatus.ACTIVE,
                                    startDate: new Date(),
                                    // endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                }
                            }
                        }
                    });

                    // Get admin so as to get the ID
                    // const adminRole = await this.prisma.role.findFirst({where: {name: 'ADMIN'}});
                    const adminRole = await tx.role.upsert({
                        create: {name: RoleType.ADMIN},
                        update: {},
                        where: {name: RoleType.ADMIN}
                    });

                    // Create the default admin user for tenant (company)
                    const adminUser = await tx.user.create({
                        data: {
                            name: adminName || 'Admin',
                            password: hashedPassword,
                            tenantId: newTenant.id,
                            roleId: adminRole.id,
                            email
                        }
                    });
                    return adminUser;
                }
            );

            // BG job for welcome email
            await this.jqService.welcomeEmailJob({
                email: txResult.email,
                name: txResult.name
            });
            
            // Return payload
            return plainToInstance(
                ResponseDTO, txResult, { excludeExtraneousValues: true }
            );

        } catch (error) {
            if (error.code === 'P2002') throw new BadRequestException('Invalid email..');
            throw error;
        }
    }

    async login(payload: LoginDTO) {
        // const token = this.configService.get<string>('JWT_SECRET');
        const { email, password } = payload;
        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { role: true}
        });
        if (!user) throw new BadRequestException('Invalid credentials...');
        // Verify password
        const verified = verifyValue(password, user.password);
        if (!verified) throw new BadRequestException('Invalid credentials...');

        // Create and return JWT tokens
        return await this.genAccessAndRefreshToken(user);
        // return plainToInstance(ResponseDTO, user);
    }

    async refresh(refreshToken: string) {
        try {
            // Verify if refresh token is valid
            const payload = await this.jwt.verifyToken(refreshToken, true);

            // Find user and verify if user has hashed token
            // const user = await this.prisma.user.findUnique({
            //     where: { email: payload.email }
            // });
            // if (!user || !user.hashedToken) throw new Error('Access denied..');

            const hashedToken = await this.cache.get<string>(payload.id);
            if (!hashedToken) throw new UnauthorizedException('Access denied, please login...');

            // Verify if both tokens match
            const verify = await verifyValue(refreshToken, hashedToken);
            if (!verify) throw new UnauthorizedException('Access denied, please login...');

            // // Generate and return set of tokens
            return await this.genAccessAndRefreshToken(payload);

        } catch (error) {
            // throw new Error('Invalid credentials...');
            throw error;
        }
    }

    getProfile(user: {}) {
        return plainToInstance(JwtPayloadDTO, user,
            {
                excludeExtraneousValues: true
            }
        );
    }
}
