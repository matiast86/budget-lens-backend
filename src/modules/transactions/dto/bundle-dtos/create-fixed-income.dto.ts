import { IntersectionType } from '@nestjs/swagger';
import { CreateIncomeDto } from '../create-income.dto';
import { FixedBundleDto } from './fixed-bundle.dto';

export class CreateFixedIncomeDto extends IntersectionType(
  CreateIncomeDto,
  FixedBundleDto,
) {}
