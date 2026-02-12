import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { GetUser } from 'src/decorators/get-user/get-user.decorator';
import { AuthGuard } from 'src/guards/auth/auth.guard';

import { LedgerFrom } from 'src/decorators/ledger-from/ledger-from.decorator';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { LedgerDashboardResponseDto } from './dto/ledger-dashboard-response.dto';
import { LedgerResponseDto } from './dto/ledger-response.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';
import { LedgerRequest } from './entities/ledger-request';
import { LedgersService } from './ledgers.service';

@ApiTags('Ledgers')
@ApiBearerAuth()
@Controller('ledgers')
@UseGuards(AuthGuard)
export class LedgersController {
  constructor(private readonly ledgersService: LedgersService) {}

  // CREATE
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({ summary: 'Create a new ledger for the authenticated user' })
  @ApiResponse({
    status: 201,
    description: 'Ledger successfully created',
    type: LedgerDashboardResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async create(
    @Body() createLedgerDto: CreateLedgerDto,
    @GetUser('id') ownerId: string,
  ): Promise<LedgerDashboardResponseDto> {
    return this.ledgersService.create(ownerId, createLedgerDto);
  }

  // FIND ALL (PAGINATED)
  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({
    summary: 'Retrieve all ledgers owned by the authenticated user (paginated)',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip (offset). Default: 0',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to return. Default: 10',
  })
  @ApiResponse({
    status: 200,
    description: 'List of owned ledgers',
    type: [LedgerDashboardResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip = 0,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take = 10,
    @GetUser('id') ownerId: string,
  ): Promise<LedgerDashboardResponseDto[]> {
    return this.ledgersService.findLedgersByOwner(ownerId, skip, take);
  }

  // FIND ONE
  @HttpCode(HttpStatus.OK)
  @LedgerFrom('ledger')
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a ledger by its ID' })
  @ApiResponse({
    status: 200,
    description: 'Ledger found',
    type: LedgerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ledger not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async findOne(@Req() req: LedgerRequest): Promise<LedgerResponseDto> {
    return (
      req.ledger ?? (await this.ledgersService.findOne(Number(req.params.id)))
    );
  }

  // UPDATE
  @HttpCode(HttpStatus.OK)
  @LedgerFrom('ledger')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a ledger by ID' })
  @ApiResponse({
    status: 200,
    description: 'Ledger updated',
    type: LedgerDashboardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ledger not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async update(
    @Req() req: LedgerRequest,
    @Body() updateLedgerDto: UpdateLedgerDto,
  ): Promise<LedgerDashboardResponseDto> {
    return await this.ledgersService.update(
      Number(req.params.id),
      updateLedgerDto,
    );
  }

  // DELETE
  @HttpCode(HttpStatus.OK)
  @LedgerFrom('ledger')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a ledger by ID' })
  @ApiResponse({ status: 200, description: 'Ledger successfully removed' })
  @ApiResponse({ status: 404, description: 'Ledger not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async remove(@Req() req: LedgerRequest): Promise<void> {
    return this.ledgersService.remove(Number(req.params.id));
  }
}
