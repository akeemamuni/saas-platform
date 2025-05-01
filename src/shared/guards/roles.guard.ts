import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType } from '@prisma/client';
import { RolesKey } from '../decorators/roles.decorator';

// Roles guard to determine the role of user
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(cxt: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
            RolesKey,
            [cxt.getHandler(), cxt.getClass()],
        );

        if (!requiredRoles) return true;

        const { user } = cxt.switchToHttp().getRequest();
        return requiredRoles.includes(user.role?.name);
    }
}
