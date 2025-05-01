import { Controller, Get, UseGuards } from '@nestjs/common';
import { PlanService } from './plan.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@Controller('plan')
export class PlanController {
    constructor(private readonly planService: PlanService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.ADMIN)
    findAll() {
        return this.planService.findAll()
    }
}
