import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CacheService } from 'src/shared/cache/cache.service';

@Injectable()
export class RoleService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: CacheService
    ) {}

    async findAll() {
        const allRoles = await this.cache.get('allRoles');
        if (allRoles) return allRoles;

        const roles = await this.prisma.role.findMany({
            orderBy: { name: 'asc' }
        });
        if (roles) await this.cache.set('allRoles', roles, 1000*60*60*12);
        return roles;
    }
}
