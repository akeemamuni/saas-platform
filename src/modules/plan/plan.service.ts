import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class PlanService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.plan.findMany();
    }
}
