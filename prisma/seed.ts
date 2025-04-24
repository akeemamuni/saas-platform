import { PrismaClient, RoleType, SubscriptionStatus } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seeding...');

    // 1. Create Roles
    const [adminRole, managerRole, memberRole] = await Promise.all([
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
    console.log('✅ Roles seeded');

    // 2. Create Plans
    const [basicPlan, proPlan] = await Promise.all([
        prisma.plan.create({
            data: {
                name: 'Basic',
                priceInCents: 9900,
                maxUsers: 5,
                stripeProductId: 'prod_basic_123',
            },
        }),
        prisma.plan.create({
            data: {
                name: 'Pro',
                priceInCents: 19900,
                maxUsers: 20,
                stripeProductId: 'prod_pro_456',
            },
        }),
    ]);
    console.log('✅ Plans seeded');

    // 3. Create Tenant
    const tenant = await prisma.tenant.create({
        data: {
            name: 'Acme Corp',
        },
    });
    console.log('✅ Tenant seeded');

    // 4. Create User for the tenant (ADMIN)
    const passwordHash = await hash('password123', 10);
    const user = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'john@acme.com',
            password: passwordHash,
            tenantId: tenant.id,
            roleId: adminRole.id,
        },
    });
    console.log('✅ User seeded');

    // 5. Create Subscription for the tenant
    await prisma.subscription.create({
        data: {
            tenantId: tenant.id,
            planId: basicPlan.id,
            stripeSubId: 'sub_abc_123',
            status: SubscriptionStatus.ACTIVE,
            startDate: new Date(),
            trialEndsAt: new Date(new Date().setDate(new Date().getDate() + 14)),
            // trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day trial
        },
    });
    console.log('✅ Subscription seeded');
}

main()
    .then(() => {
        console.log('🌱 Seeding complete');
        return prisma.$disconnect();
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
