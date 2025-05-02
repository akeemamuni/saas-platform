import { IsString, IsNotEmpty } from "class-validator";

export class SubscribeDto {
    @IsString()
    @IsNotEmpty()
    planId: string;
}
