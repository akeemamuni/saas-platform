import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CacheService } from 'src/shared/cache/cache.service';

@Injectable()
export class PlanService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: CacheService
    ) {}

    async findAll() {
        const allPlans = await this.cache.get('allPlans');
        if (allPlans) return allPlans;

        const plans = await this.prisma.plan.findMany({
            orderBy: { priceInCents: 'asc' }
        });
        if (plans) await this.cache.set('allPlans', plans, 1000*60*60*12);
        return plans;
    }
}
