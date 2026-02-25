import { PartialType } from '@nestjs/swagger';
import { CreateDebtOwnerDto } from './create-debt-owner.dto';

export class UpdateDebtOwnerDto extends PartialType(CreateDebtOwnerDto) {}
