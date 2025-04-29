import { RoleType } from '@prisma/client';
import { IsEnum } from 'class-validator';

// export enum RoleType {
//   ADMIN = 'ADMIN',
//   MANAGER = 'MANAGER',
//   MEMBER = 'MEMBER',
// }

export class CreateRoleDTO {
  @IsEnum(RoleType)
  name: RoleType;
}
