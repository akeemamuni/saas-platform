import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { hashValue, verifyValue } from './utils/hash.util';
import { SubscriptionStatus, RoleType } from '@prisma/client';
import { JwtService } from 'src/shared/jwt/jwt.service';
import { plainToInstance } from 'class-transformer';
import { ResponseDTO } from './dto/response.dto';
import { JwtPayload } from 'src/types/payload.type';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService
    ) {}

    private async genAccessAndRefreshToken(jwtPayload: JwtPayload) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.genAccessToken(jwtPayload),
            this.jwt.genRefreshToken(jwtPayload)
        ]);

        // Hash and store refresh token
        const hashedToken = await hashValue(refreshToken);
        await this.prisma.user.update({
            where: {id: jwtPayload.userId},
            data: { hashedToken }
        });

        return { accessToken, refreshToken };
    }

    async register(payload: RegisterDTO) {
        // const token = this.configService.get<string>('JWT_SECRET');
        const { companyName, adminName, email, password, plan } = payload;
        // Find new tenant selected plan
        const selectedPlan = await this.prisma.plan.findFirst({where: {name: plan}});
        // Added layer of checking plan other than DTO
        if (!selectedPlan) throw new Error('Invalid plan..');
        // Hash password
        const hashedPassword = await hashValue(password);

        try {
            const transactionResult = await this.prisma.$transaction(
                async (tx) => {
                    // Create new tenant (company)
                    const newTenant = await tx.tenant.create({
                        data: {
                            name: companyName,
                            subscription: {
                                create: {
                                    planId: selectedPlan.id,
                                    status: SubscriptionStatus.TRIALING,
                                    stripeSubId: `invalid-${new Date()}`,
                                    startDate: new Date(),
                                    trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
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
                            email: email,
                            password: hashedPassword,
                            tenantId: newTenant.id,
                            roleId: adminRole.id
                        }
                    });
                    return adminUser;
                }
            );
            return plainToInstance(ResponseDTO, transactionResult);

        } catch (error) {
            if (error.code === 'P2002') throw new Error('Invalid email..');
            throw error;
        }
    }

    async login(payload: LoginDTO) {
        // const token = this.configService.get<string>('JWT_SECRET');
        const { email, password } = payload;
        // Find user
        const user = await this.prisma.user.findFirst({where: { email }});
        if (!user) throw new Error('Invalid credentials...');
        // Verify password
        const verified = verifyValue(password, user.password);
        if (!verified) throw new Error('Invalid credentials...');

        // Create and return JWT tokens
        const jwtPayload = {
            userId: user.id,
            email: user.email,
            tenantId: user.tenantId,
            roleId: user.roleId
        };
        return await this.genAccessAndRefreshToken(jwtPayload);
        // return plainToInstance(ResponseDTO, user);
    }

    async refresh(token: string) {
        try {
            // Verify if refresh token is valid
            const payload = await this.jwt.verifyToken(token, true);

            // Find user and verify if user has hashed token
            const user = await this.prisma.user.findUnique({
                where: { email: payload.email }
            });
            if (!user || !user.hashedToken) throw new Error('Access denied..');

            // Verify if both tokens match
            const verify = await verifyValue(token, user.hashedToken);
            if (!verify) throw new Error('Access denied...');

            // Generate and return set of tokens
            const jwtPayload = {
                userId: payload.userId,
                email: payload.email,
                tenantId: payload.tenantId,
                roleId: payload.roleId
            };

            return await this.genAccessAndRefreshToken(jwtPayload);

        } catch (error) {
            // throw new Error('Invalid credentials...');
            throw error;
        }
    }
}
