import { PrismaClient, RoleType, SubscriptionStatus } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

// Clean database and seed
export const resetTestDB = async () => {
    await prisma.$executeRawUnsafe(
        `TRUNCATE "User", "Tenant", "Role", "Plan", "_prisma_migrations" RESTART IDENTITY CASCADE;`
    );

    // console.log('Test DB seeding started...');
    const [adminRole, memberRole] = await Promise.all([
        prisma.role.upsert({
            where: { name: RoleType.ADMIN },
            update: {},
            create: { name: RoleType.ADMIN }
        }),
        prisma.role.upsert({
            where: { name: RoleType.MEMBER },
            update: {},
            create: { name: RoleType.MEMBER }
        })
    ]);

    const plan = await prisma.plan.create({data: {
        name: 'Basic',
        priceInCents: 9900,
        maxUsers: 5
    }});

    const tenant = await prisma.tenant.create({
        data: { name: 'Test Company' }
    });

    const password = process.env.PASSWORD || 'Password';
    const passwordHash = await hash(password, 10);

    await prisma.user.createMany({data: [
        {
            name: 'Test Admin',
            email: 'admin@test.com',
            password: passwordHash,
            tenantId: tenant.id,
            roleId: adminRole.id,
        },
        {
            name: 'Test User',
            email: 'user@test.com',
            password: passwordHash,
            tenantId: tenant.id,
            roleId: memberRole.id,
        }
    ]});

    await prisma.subscription.create({data: {
        tenantId: tenant.id,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date()
    }});

    // console.log('Test DB seeding complete...');
}

// Close DB connection
export const disconnectTestDB = async () => {
    await prisma.$disconnect();
}
