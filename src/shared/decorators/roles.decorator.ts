import { SetMetadata } from '@nestjs/common';
import { RoleType } from '@prisma/client';

export const RolesKey = 'roles';
export const Roles = (...roles: RoleType[]) => SetMetadata(RolesKey, roles);
