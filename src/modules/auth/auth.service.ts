import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { hashPassword, verifyPassword } from './utils/hash.util';
import { SubscriptionStatus, RoleType } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { ResponseDTO } from './dto/response.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService
    ) {}

    async register(payload: RegisterDTO) {
        // const token = this.configService.get<string>('JWT_SECRET');
        const { companyName, adminName, email, password, plan } = payload;
        // Find new tenant selected plan
        const selectedPlan = await this.prisma.plan.findFirst({where: {name: plan}});
        // Added layer of checking plan other than DTO
        if (!selectedPlan) throw new Error('Invalid plan..');
        // Hash password
        const hashedPassword = await hashPassword(password);

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
        const verified = verifyPassword(password, user.password);
        if (!verified) throw new Error('Invalid credentials...');
        return plainToInstance(ResponseDTO, user);
    }
}
