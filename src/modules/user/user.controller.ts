import { Controller, Get, Post, Body, UseGuards, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { AuthUser } from 'src/shared/decorators/auth-user.decorator';
import { RoleType } from '@prisma/client';
import { JwtPayload } from 'src/shared/types/payload.type';
import { plainToInstance } from 'class-transformer';
import { FindUserResDto } from './dto/response.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.ADMIN)
    create(@AuthUser() user: JwtPayload, @Body(ValidationPipe) userDto: CreateUserDto) {
        return this.userService.createTenantUser(user, userDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.ADMIN)
    async findAll(@AuthUser() user: JwtPayload) {
        const users = await this.userService.getTenantUsers(user);
        const total = users.length;
        return plainToInstance(
            FindUserResDto, [{ total }, ...users],
            {
                excludeExtraneousValues: true
            }
        );
    }
}
