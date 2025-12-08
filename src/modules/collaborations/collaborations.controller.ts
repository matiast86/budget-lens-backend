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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { CollaborationsService } from './collaborations.service';
import { CollaborationResponseDto } from './dto/collaboration-response.dto';
import { UpdateCollaborationDto } from './dto/update-collaboration.dto';

@ApiBearerAuth()
@ApiTags('Collaborations')
@UseGuards(AuthGuard)
@Controller('collaborations')
export class CollaborationsController {
  constructor(private readonly collaborationsService: CollaborationsService) {}

  @ApiOperation({ summary: 'Create a collaboration between a ledger and user' })
  @ApiParam({
    name: 'ledgerId',
    type: Number,
    description: 'ID of the ledger to share',
    example: 10,
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'UUID of the user to add as collaborator',
    example: 'c5f5b510-6bbd-4a3d-b4b2-30f67d5c9133',
  })
  @ApiResponse({
    status: 201,
    description: 'Collaboration created successfully',
    type: CollaborationResponseDto,
  })
  @Post('ledgers/:ledgerId/users/:userId')
  async create(
    @Param('ledgerId', ParseIntPipe) ledgerId: number,
    @Param('userId') userId: string,
  ): Promise<CollaborationResponseDto> {
    return await this.collaborationsService.create(ledgerId, userId);
  }

  @ApiOperation({ summary: 'List active collaborations for a user' })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'UUID of the collaborator user',
    example: 'c5f5b510-6bbd-4a3d-b4b2-30f67d5c9133',
  })
  @ApiResponse({
    status: 200,
    description: 'Active collaborations for the given user',
    type: [CollaborationResponseDto],
  })
  @Get('users/:userId')
  async findAllByUserId(
    @Param('userId') userId: string,
  ): Promise<CollaborationResponseDto[]> {
    return await this.collaborationsService.findAllByUserId(userId);
  }

  @ApiOperation({ summary: 'List collaborations for a ledger' })
  @ApiParam({
    name: 'ledgerId',
    type: Number,
    description: 'ID of the ledger whose collaborations will be listed',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Collaborations for the given ledger',
    type: [CollaborationResponseDto],
  })
  @Get('ledgers/:ledgerId')
  async findAllByLedgerId(
    @Param('ledgerId', ParseIntPipe) ledgerId: number,
  ): Promise<CollaborationResponseDto[]> {
    return await this.collaborationsService.findAllByLedgerId(ledgerId);
  }

  @ApiOperation({ summary: 'Get a collaboration by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the collaboration',
    example: 45,
  })
  @ApiResponse({
    status: 200,
    description: 'Collaboration found',
    type: CollaborationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Collaboration not found' })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CollaborationResponseDto> {
    return await this.collaborationsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a collaboration' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the collaboration to update',
    example: 45,
  })
  @ApiResponse({
    status: 200,
    description: 'Collaboration updated successfully',
    type: CollaborationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Collaboration not found' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCollaborationDto: UpdateCollaborationDto,
  ): Promise<CollaborationResponseDto> {
    return await this.collaborationsService.update(id, updateCollaborationDto);
  }

  @ApiOperation({ summary: 'Soft-delete a collaboration' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the collaboration to deactivate',
    example: 45,
  })
  @ApiResponse({ status: 204, description: 'Collaboration deactivated' })
  @ApiResponse({ status: 404, description: 'Collaboration not found' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.collaborationsService.remove(id);
  }

  @ApiOperation({ summary: 'Reactivate a collaboration' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the collaboration to reactivate',
    example: 45,
  })
  @ApiResponse({ status: 204, description: 'Collaboration reactivated' })
  @ApiResponse({ status: 404, description: 'Collaboration not found' })
  @Patch(':id/reactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reactivate(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.collaborationsService.reactivateCollaboration(id);
  }
}
