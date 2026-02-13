import { PartialType } from '@nestjs/swagger';
import { CreateInflationIndexDto } from './create-inflation-index.dto';

export class UpdateInflationIndexDto extends PartialType(CreateInflationIndexDto) {}
