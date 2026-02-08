import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InflationIndexesRepository {
  constructor(private readonly prisma: PrismaService) {}
}
