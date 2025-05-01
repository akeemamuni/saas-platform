import { ForbiddenException, Injectable, NotAcceptableException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtPayload } from 'src/shared/types/payload.type';
import { RoleType } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { CreateUserResDto } from './dto/create-res.dto';
import { hashValue } from 'src/shared/utils/hash.util';
import { FindUserResDto } from './dto/response.dto';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async createTenantUser(user: JwtPayload, createUserDto: CreateUserDto) {
        // Current user must be tenant admin
        if (user.role.name !== RoleType.ADMIN) {
            throw new ForbiddenException('Only ADMINS Allowed..');
        }
        // Hash password
        const hashedPassword = await hashValue(createUserDto.password);
        // Fetch role from DB and create new user
        const selectedRole = await this.prisma.role.findUnique({
            where: { name: createUserDto.role}
        });
        if (!selectedRole) throw new NotAcceptableException('Role is not valid..');
        const newUser = await this.prisma.user.create({
            data: {
                name: createUserDto.name,
                email: createUserDto.email,
                password: hashedPassword,
                tenantId: user.tenantId,
                roleId: selectedRole.id
            }
        });
        // Construct new object to include role name
        const result = { ...newUser, role: selectedRole.name}
        return plainToInstance(
            CreateUserResDto, result,
            {
                excludeExtraneousValues: true
            }
        );
    }

    async getTenantUsers(user: JwtPayload) {
        if (user.role.name !== RoleType.ADMIN) {
            throw new ForbiddenException('Only ADMINS Allowed..');
        }
        // Fetch all users under tenant
        const tenantUsers = await this.prisma.user.findMany({
            where: { tenantId: user.tenantId },
            include: { role: true }
        });
        return plainToInstance(
            FindUserResDto, tenantUsers,
            {
                excludeExtraneousValues: true
            }
        );
    }
}
