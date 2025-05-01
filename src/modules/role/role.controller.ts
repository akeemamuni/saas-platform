import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@Controller('role')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.ADMIN)
    findAll() {
        return this.roleService.findAll();
    }
}
