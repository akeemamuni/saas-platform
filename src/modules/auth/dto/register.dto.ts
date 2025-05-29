import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { LoginDTO } from './login.dto';

export enum PlanType {
    BASIC = 'Basic',
    PRO = 'Pro',
    GOLD = 'Gold'
}

export class RegisterDTO extends LoginDTO {
    @IsNotEmpty()
    @IsString()
    companyName: string;

    @IsOptional()
    @IsString()
    adminName?: string;

    @IsOptional()
    @IsEnum(PlanType, {message: 'Please input a valid plan..'})
    plan?: PlanType;
}
