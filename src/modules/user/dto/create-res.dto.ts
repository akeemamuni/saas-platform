import { Exclude, Expose } from "class-transformer";
import { PartialType } from "@nestjs/mapped-types";
import { RoleType } from "@prisma/client";
import { CreateUserDto } from "./create-user.dto";

export class CreateUserResDto extends PartialType(CreateUserDto) {
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
    role: RoleType;
    
    @Expose()
    tenantId: string;

    @Expose()
    roleId: string;

    // @Expose()
    // createdAt: Date;

    // @Expose()
    // updatedAt: Date;
}
