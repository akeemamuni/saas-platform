import { Exclude, Expose, Type } from "class-transformer";
import { RoleDTO } from "src/modules/auth/dto/jwt-payload.dto";
import { ValidateNested } from "class-validator";

export class FindUserResDto {
    @Exclude()
    password: string;

    @Exclude()
    hashedToken: string;

    @Expose()
    id: string;
    
    @Expose()
    name: string;

    @Expose()
    email: string;

    @Expose()
    tenantId: string;

    @Expose()
    @ValidateNested()
    @Type(() => RoleDTO)
    role: RoleDTO;
}
