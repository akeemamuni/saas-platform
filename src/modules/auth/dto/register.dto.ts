import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { LoginDTO } from './login.dto';

export enum PlanType {
    BASIC = 'Basic',
    PRO = 'Pro'
}

export class RegisterDTO extends LoginDTO {
    @IsNotEmpty()
    @IsString()
    companyName: string;

    @IsOptional()
    @IsString()
    adminName?: string;

    @IsEnum(PlanType, {message: 'Please input a valid plan..'})
    plan: PlanType;
}
