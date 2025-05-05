import { IsString, IsNotEmpty, IsEmail, IsUUID, IsEnum } from "class-validator";
import { RoleType } from "@prisma/client";

// export enum UserRoleType {
//     MANAGER = 'MANAGER',
//     MEMBER = 'MEMBER'
// }

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsEnum(RoleType, {message: 'Please select a valid role: ADMIN | MANAGER | MEMBER..'})
    role: RoleType;
}
