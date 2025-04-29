import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
// import { CreatePlanDTO } from './dto/create-plan.dto';
// import { UpdatePlanDTO } from './dto/update-plan.dto';

@Injectable()
export class PlanService {
    constructor(private readonly prisma: PrismaService) {}

    // async create(data: CreatePlanDTO) {
    //     return this.prisma.plan.create({ data });
    // }

    async findAll() {
        return this.prisma.plan.findMany();
    }

    // async findOne(id: string) {
    //     const plan = await this.prisma.plan.findUnique({ where: { id } });
    //     if (!plan) throw new NotFoundException('Plan not found...');
    //     return plan;
    // }

    // async update(id: string, data: UpdatePlanDTO) {
    //     await this.findOne(id);
    //     return this.prisma.plan.update({
    //         where: { id },
    //         data,
    //     });
    // }

    // async remove(id: string) {
    //     await this.findOne(id);
    //     return this.prisma.plan.delete({ where: { id } });
    // }
}
