import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { GetUser } from 'src/decorators/get-user/get-user.decorator';
import { AuthGuard } from 'src/guards/auth/auth.guard';

import { LedgerDetailView } from 'src/types/entities/ledger.types';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { LedgerDashboardResponseDto } from './dto/ledger-dashboard-response.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';
import { LedgersService } from './ledgers.service';

@ApiTags('Ledgers')
@ApiBearerAuth()
@Controller('ledgers')
@UseGuards(AuthGuard)
export class LedgersController {
  constructor(private readonly ledgersService: LedgersService) {}

  // ────────────────────────────────────────────────
  // CREATE
  // ────────────────────────────────────────────────
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({ summary: 'Create a new ledger for the authenticated user' })
  @ApiResponse({
    status: 201,
    description: 'Ledger successfully created',
    type: LedgerDashboardResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() createLedgerDto: CreateLedgerDto,
    @GetUser('id') ownerId: string,
  ): Promise<LedgerDashboardResponseDto> {
    return this.ledgersService.create(ownerId, createLedgerDto);
  }

  // ────────────────────────────────────────────────
  // FIND ALL
  // ────────────────────────────────────────────────
  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({ summary: 'Retrieve all ledgers' })
  @ApiResponse({
    status: 200,
    description: 'List of ledgers',
    type: [LedgerDashboardResponseDto],
  })
  async findAll(
    @GetUser('id') ownerId: string,
  ): Promise<LedgerDashboardResponseDto[]> {
    return this.ledgersService.findAll(ownerId);
  }

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
  async findAllPaginated(
    @Query('skip', ParseIntPipe) skip: number = 0,
    @Query('take', ParseIntPipe) take: number = 10,
    @GetUser('id') ownerId: string,
  ) {
    return this.ledgersService.findLedgersByOwner(ownerId, skip, take);
  }

  // ────────────────────────────────────────────────
  // FIND ONE
  // ────────────────────────────────────────────────
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a ledger by its ID' })
  @ApiResponse({
    status: 200,
    description: 'Ledger found',
  })
  @ApiResponse({ status: 404, description: 'Ledger not found' })
  async findOne(@Param('id') id: string): Promise<LedgerDetailView> {
    return await this.ledgersService.findOne(+id);
  }

  // ────────────────────────────────────────────────
  // UPDATE
  // ────────────────────────────────────────────────
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a ledger by ID' })
  @ApiResponse({
    status: 200,
    description: 'Ledger updated',
    type: LedgerDashboardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ledger not found' })
  async update(
    @Param('id') id: string,
    @Body() updateLedgerDto: UpdateLedgerDto,
  ): Promise<LedgerDashboardResponseDto> {
    return await this.ledgersService.update(+id, updateLedgerDto);
  }

  // ────────────────────────────────────────────────
  // DELETE
  // ────────────────────────────────────────────────
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a ledger by ID' })
  @ApiResponse({ status: 200, description: 'Ledger successfully removed' })
  @ApiResponse({ status: 404, description: 'Ledger not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.ledgersService.remove(+id);
  }
}
