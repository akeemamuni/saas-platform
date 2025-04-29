import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanDTO } from './create-plan.dto';

export class UpdatePlanDto extends PartialType(CreatePlanDTO) {}
