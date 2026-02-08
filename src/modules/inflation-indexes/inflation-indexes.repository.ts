import { Injectable } from '@nestjs/common';
import { InflationIndex } from 'prisma/generated/prisma/client';
import { InflationIndexCreateInput } from 'prisma/generated/prisma/models';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InflationIndexesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: InflationIndexCreateInput): Promise<InflationIndex> {
    
  }
}
