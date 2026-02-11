import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, Min } from 'class-validator';
import { DebtDirection } from 'prisma/generated/prisma/enums';

export class DebtAssignmentDto {
  @ApiProperty({
    description: 'ID of the debt owner.',
    example: 15,
  })
  @IsInt()
  @Min(1)
  debtOwnerId: number;

  @ApiProperty({
    description: 'Debt amount assigned to this owner.',
    example: 12000,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    enum: DebtDirection,
    description: 'Whether the debt is owed to or by the user.',
    example: DebtDirection.OWED_TO_ME,
  })
  @IsEnum(DebtDirection)
  direction: DebtDirection;

  constructor(partial: Partial<DebtAssignmentDto>) {
    Object.assign(this, partial);
  }
}
