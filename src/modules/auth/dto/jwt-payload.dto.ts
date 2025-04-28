import { Expose } from "class-transformer";
import { IsString, IsNotEmpty, IsEmail } from "class-validator";

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
    @IsString()
    @IsNotEmpty()
    roleId: string;
}
