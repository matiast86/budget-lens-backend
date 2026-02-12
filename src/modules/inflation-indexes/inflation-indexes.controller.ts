import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Currency, Role } from 'prisma/generated/prisma/enums';
import { Roles } from 'src/decorators/roles/roles.decorator';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { CreateInflationIndexDto } from './dto/create-inflation-index.dto';
import { InflationIndexResponseDto } from './dto/inflation-index-response.dto';
import { UpdateInflationIndexDto } from './dto/update-inflation-index.dto';
import { InflationIndexesService } from './inflation-indexes.service';

@ApiBearerAuth()
@ApiTags('Inflation Indexes')
@UseGuards(RolesGuard)
@Controller('inflation-indexes')
export class InflationIndexesController {
  constructor(
    private readonly inflationIndexesService: InflationIndexesService,
  ) {}

  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new inflation index entry' })
  @ApiCreatedResponse({ type: InflationIndexResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid payload or duplicate entry' })
  async create(
    @Body() createInflationIndexDto: CreateInflationIndexDto,
  ): Promise<InflationIndexResponseDto> {
    return await this.inflationIndexesService.create(createInflationIndexDto);
  }

  @Get()
  @ApiOperation({ summary: 'List inflation indexes by currency' })
  @ApiQuery({
    name: 'currency',
    enum: Currency,
    description: 'Currency to filter by',
    example: Currency.ARS,
  })
  @ApiQuery({
    name: 'skip',
    type: Number,
    required: false,
    description: 'Number of records to skip (default: 0)',
    example: 0,
  })
  @ApiQuery({
    name: 'take',
    type: Number,
    required: false,
    description: 'Number of records to return (default: 50)',
    example: 50,
  })
  @ApiQuery({
    name: 'startPeriod',
    type: String,
    required: false,
    description: 'Start of period range (ISO 8601 date)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endPeriod',
    type: String,
    required: false,
    description: 'End of period range (ISO 8601 date)',
    example: '2026-12-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'orderBy',
    type: String,
    required: false,
    description:
      'Sort field and direction (e.g., "period:asc", "cpiIndex:desc")',
    example: 'period:asc',
  })
  @ApiOkResponse({ type: InflationIndexResponseDto, isArray: true })
  async findMany(
    @Query('currency', new ParseEnumPipe(Currency)) currency: Currency,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('startPeriod') startPeriod?: string,
    @Query('endPeriod') endPeriod?: string,
    @Query('orderBy') orderBy?: string,
  ): Promise<InflationIndexResponseDto[]> {
    return await this.inflationIndexesService.findMany(
      currency,
      skip ? +skip : 0,
      take ? +take : 50,
      startPeriod,
      endPeriod,
      orderBy,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an inflation index by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Inflation index ID' })
  @ApiOkResponse({ type: InflationIndexResponseDto })
  @ApiNotFoundResponse({ description: 'Inflation index not found' })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<InflationIndexResponseDto> {
    return await this.inflationIndexesService.findById(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an inflation index by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Inflation index ID' })
  @ApiOkResponse({ type: InflationIndexResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid payload' })
  @ApiNotFoundResponse({ description: 'Inflation index not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInflationIndexDto: UpdateInflationIndexDto,
  ): Promise<InflationIndexResponseDto> {
    return await this.inflationIndexesService.update(
      id,
      updateInflationIndexDto,
    );
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an inflation index by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Inflation index ID' })
  @ApiNoContentResponse({ description: 'Inflation index deleted' })
  @ApiNotFoundResponse({ description: 'Inflation index not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.inflationIndexesService.delete(id);
  }
}
