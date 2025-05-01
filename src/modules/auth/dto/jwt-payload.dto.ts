import { Expose, Type } from "class-transformer";
import { IsString, IsNotEmpty, IsEmail, ValidateNested } from "class-validator";

export class RoleDTO {
    @Expose()
    @IsString()
    @IsNotEmpty()
    id: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    name: string;
}

export class JwtPayloadDTO {
    @Expose()
    @IsString()
    @IsNotEmpty()
    id: string;

    @Expose()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    tenantId: string;

    @Expose()
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => RoleDTO)
    role: RoleDTO;
}
