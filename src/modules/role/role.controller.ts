import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('role')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    findAll() {
        return this.roleService.findAll();
    }
}
