import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { LedgerFrom } from 'src/decorators/ledger-from/ledger-from.decorator';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { LedgerRequest } from '../ledgers/entities/ledger-request';
import { DebtOwnersService } from './debt-owners.service';
import { CreateDebtOwnerDto } from './dto/create-debt-owner.dto';
import { DebtOwnerResponseDto } from './dto/debt-owner-response.dto';
import { UpdateDebtOwnerDto } from './dto/update-debt-owner.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('debt-owners')
export class DebtOwnersController {
  constructor(private readonly debtOwnersService: DebtOwnersService) {}

  @Post('ledgers/:ledgerId')
  @ApiOperation({ summary: 'Create a debt owner for a ledger' })
  @ApiParam({
    name: 'ledgerId',
    type: Number,
    description: 'ID of the ledger that owns this debt owner',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Debt owner created successfully',
    type: DebtOwnerResponseDto,
  })
  async create(
    @Param('ledgerId', ParseIntPipe) ledgerId: number,
    @Body() createDebtOwnerDto: CreateDebtOwnerDto,
  ): Promise<DebtOwnerResponseDto> {
    return await this.debtOwnersService.create(ledgerId, createDebtOwnerDto);
  }

  @Get('ledgers/:ledgerId')
  @ApiOperation({
    summary: 'List debt owners for a ledger (paginated)',
  })
  @ApiParam({
    name: 'ledgerId',
    type: Number,
    description: 'ID of the ledger whose debt owners will be listed',
    example: 1,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    example: 0,
    description: 'Number of records to skip for pagination',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of records to return for pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'List of debt owners for the given ledger',
    type: [DebtOwnerResponseDto],
  })
  async findAll(
    @Param('ledgerId', ParseIntPipe) ledgerId: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
  ): Promise<DebtOwnerResponseDto[]> {
    return await this.debtOwnersService.findAll(skip, take, ledgerId);
  }

  @LedgerFrom('debtOwner', 'id')
  @Get(':id')
  @ApiOperation({ summary: 'Get a debt owner by its ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the debt owner',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Debt owner found',
    type: DebtOwnerResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Debt owner not found',
  })
  async findOne(@Req() req: LedgerRequest): Promise<DebtOwnerResponseDto> {
    return (
      req.debtOwner ??
      (await this.debtOwnersService.findById(Number(req.params.id)))
    );
  }

  @Get('ledgers/:ledgerId/by-name/:name')
  @ApiOperation({ summary: 'Get a debt owner by name within a ledger' })
  @ApiParam({
    name: 'ledgerId',
    type: Number,
    description: 'ID of the ledger where the debt owner belongs',
    example: 1,
  })
  @ApiParam({
    name: 'name',
    type: String,
    description: 'Name of the debt owner',
    example: 'Sister',
  })
  @ApiResponse({
    status: 200,
    description: 'Debt owner found in the specified ledger',
    type: DebtOwnerResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Debt owner not found in this ledger',
  })
  async findByName(
    @Param('ledgerId', ParseIntPipe) ledgerId: number,
    @Param('name') name: string,
  ): Promise<DebtOwnerResponseDto> {
    return this.debtOwnersService.findByNameInLedger(ledgerId, name);
  }

  @LedgerFrom('debtOwner', 'id')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a debt owner by its ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the debt owner to update',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Debt owner updated successfully',
    type: DebtOwnerResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Debt owner not found',
  })
  async update(
    @Req() req: LedgerRequest,
    @Body() updateDebtOwnerDto: UpdateDebtOwnerDto,
  ): Promise<DebtOwnerResponseDto> {
    return await this.debtOwnersService.update(
      Number(req.params.id),
      updateDebtOwnerDto,
    );
  }

  @LedgerFrom('debtOwner', 'id')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a debt owner by its ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the debt owner to delete',
    example: 5,
  })
  @ApiResponse({
    status: 204,
    description: 'Debt owner deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Debt owner not found',
  })
  async remove(@Req() req: LedgerRequest): Promise<void> {
    return await this.debtOwnersService.remove(Number(req.params.id));
  }
}
