import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePlanDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  priceInCents: number;

  @IsNumber()
  maxUsers: number;
}
