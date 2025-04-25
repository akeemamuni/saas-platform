import { Exclude, Expose } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { RegisterDTO } from './register.dto';
// import { PlanType } from './register.dto';

// What to send back and not reveal the password
export class ResponseDTO extends PartialType(RegisterDTO) {
    @Expose()
    id: string;
  
    @Expose()
    name: string;
  
    @Expose()
    email: string;

    @Expose()
    roleId: string

    @Expose()
    tenantId: string
  
    @Expose()
    createdAt: Date;
  
    @Expose()
    updatedAt: Date;
  
    @Exclude()
    password: string;
}

// Another method of doing the above
// export class TenantResponseDTO {
//   @Expose()
//   id: string;

//   @Expose()
//   companyName: string;

//   @Expose()
//   adminName?: string;

//   @Expose()
//   email: string;

//   @Expose()
//   plan: string;

//   @Expose()
//   createdAt: Date;

//   @Expose()
//   updatedAt: Date;

//   @Exclude()
//   password: string;

//   constructor(partial: Partial<TenantResponseDTO>) {
//     Object.assign(this, partial);
//   }
// }
