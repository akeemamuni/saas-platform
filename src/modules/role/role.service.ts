import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateRoleDTO } from './dto/create-role.dto';
import { UpdateRoleDTO } from './dto/update-role.dto';

@Injectable()
export class RoleService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: CreateRoleDTO) {
        return this.prisma.role.create({ data });
    }

    async findAll() {
        return this.prisma.role.findMany();
    }

    async findOne(id: string) {
        const role = await this.prisma.role.findUnique({ where: { id } });
        if (!role) throw new NotFoundException('Role not found');
        return role;
    }

    async update(id: string, data: UpdateRoleDTO) {
        await this.findOne(id);
        return this.prisma.role.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.role.delete({ where: { id } });
    }
}
