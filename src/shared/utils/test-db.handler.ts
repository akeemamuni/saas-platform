import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Clean database
export const resetTestDB = async () => {
    await prisma.$executeRawUnsafe(
        `TRUNCATE "User", "Tenant", "Role", "Plan", "_prisma_migrations" RESTART IDENTITY CASCADE;`
    );
}

// Close DB connection
export const disconnectTestDB = async () => {
    await prisma.$disconnect();
}
