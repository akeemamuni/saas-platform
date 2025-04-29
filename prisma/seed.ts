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
    const [basicPlan, proPlan, entPlan] = await Promise.all([
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
                maxUsers: 20,
            },
        }),
        prisma.plan.create({
            data: {
                name: 'Gold',
                priceInCents: 29900,
                maxUsers: 75,
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
            status: SubscriptionStatus.ACTIVE,
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
            // trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day trial
        },
    });
    console.log('✅ Subscription seeded');
}

async function addNewPlan() {
    console.log('Try to add a new plan...');
    try {
        await prisma.plan.create({
            data: {
                name: 'Gold',
                priceInCents: 29900,
                maxUsers: 75,
            },
        });
        console.log('✅ Plan added successfully..')
    } catch (error) {
        console.error(error)
    }
}

// main()
//     .then(() => {
//         console.log('🌱 Seeding complete');
//         return prisma.$disconnect();
//     })
//     .catch((e) => {
//         console.error(e);
//         process.exit(1);
//     });

addNewPlan();
