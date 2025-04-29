import { Body, Controller, Post, Get, Patch, Delete, UseGuards, Param, ValidationPipe } from '@nestjs/common';
import { PlanService } from './plan.service';
// import { CreatePlanDTO } from './dto/create-plan.dto';
// import { UpdatePlanDTO } from './dto/update-plan.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
// import { AuthUser } from 'src/shared/decorators/auth-user.decorator';

@Controller('plan')
export class PlanController {
    constructor(private readonly planService: PlanService) {}

    // @Post()
    // @UseGuards(JwtAuthGuard)
    // create(@AuthUser() user: {}, @Body(ValidationPipe) createPlanDto: CreatePlanDTO) {
    //     return this.planService.create(createPlanDto);
    // }

    // @Get(':id')
    // @UseGuards(JwtAuthGuard)
    // findOne(@Param('id') id: string) {
    //     return this.planService.findOne(id);
    // }

    @Get()
    @UseGuards(JwtAuthGuard)
    findAll() {
        return this.planService.findAll()
    }

    // @Patch(':id')
    // @UseGuards(JwtAuthGuard)
    // update(@Param('id') id: string, @Body(ValidationPipe) updatePlanDto: UpdatePlanDTO) {
    //     return this.planService.update(id, updatePlanDto);
    // }

    // @Delete(':id')
    // @UseGuards(JwtAuthGuard)
    // remove(@Param('id') id: string) {
    //     return this.planService.remove(id);
    // }
}
