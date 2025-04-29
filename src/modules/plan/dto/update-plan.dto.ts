import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanDTO } from './create-plan.dto';

export class UpdatePlanDTO extends PartialType(CreatePlanDTO) {}
