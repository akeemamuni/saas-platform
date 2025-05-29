import * as dotenv from 'dotenv'
import { PrismaClient, RoleType, SubscriptionStatus } from '@prisma/client';
import { hash } from 'bcrypt';

dotenv.config();
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
    const [basicPlan, _p, _g] = await Promise.all([
        prisma.plan.create({
            data: {
                name: 'Basic',
                priceInCents: 0,
                maxUsers: 2,
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
    console.log('✅ Plans seeded');

    // 3. Create Tenant
    await prisma.tenant.createMany({
        data: [
            {
                name: 'Agro Ltd',
            },
            {
                name: 'Indiq Ent',
            },
            {
                name: 'Jand Realty',
            }
        ],
        skipDuplicates: true
    });
    console.log('✅ Tenants seeded');

    // 4. Create Users for the tenants
    const password = process.env.PASSWORD || 'Password';
    const passwordHash = await hash(password, 10);
    const tenants = await prisma.tenant.findMany();

    const user = await prisma.user.createMany({
        data: [
            // First company
            {
                name: 'John Doe',
                email: 'john.d@seed.com',
                password: passwordHash,
                tenantId: tenants[0].id,
                roleId: adminRole.id,
            },
            // Second company
            {
                name: 'Thomas Andrej',
                email: 'thomas@seed.com',
                password: passwordHash,
                tenantId: tenants[1].id,
                roleId: adminRole.id,
            },
            // Third company
            {
                name: 'Julius Adamson',
                email: 'j.adamson@seed.com',
                password: passwordHash,
                tenantId: tenants[2].id,
                roleId: adminRole.id,
            },
            {
                name: 'Sara Clarence',
                email: 'sc@seed.com',
                password: passwordHash,
                tenantId: tenants[2].id,
                roleId: memberRole.id,
            },
        ],
        skipDuplicates: true
    });
    console.log('✅ Users seeded');

    // 5. Create Subscription for the tenant
    await prisma.subscription.createMany({
        data: [
            {
                tenantId: tenants[0].id,
                planId: basicPlan.id,
                status: SubscriptionStatus.ACTIVE,
                startDate: new Date()
            },
            {
                tenantId: tenants[1].id,
                planId: basicPlan.id,
                status: SubscriptionStatus.ACTIVE,
                startDate: new Date()
            },
            {
                tenantId: tenants[2].id,
                planId: basicPlan.id,
                status: SubscriptionStatus.ACTIVE,
                startDate: new Date()
            }
        ],
        skipDuplicates: true
    });
    console.log('✅ Subscriptions seeded');
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
