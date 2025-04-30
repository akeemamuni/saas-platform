import { Controller, Get, UseGuards } from '@nestjs/common';
import { PlanService } from './plan.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller('plan')
export class PlanController {
    constructor(private readonly planService: PlanService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    findAll() {
        return this.planService.findAll()
    }
}
