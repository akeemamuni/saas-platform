import { Body, Controller, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDTO } from './dto/create-role.dto';
import { UpdateRoleDTO } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('role')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body(ValidationPipe) createRoleDto: CreateRoleDTO) {
        return this.roleService.create(createRoleDto);
    }
    
}
