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
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/decorators/get-user/get-user.decorator';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupResponseDto } from './dto/group-response.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';

@ApiBearerAuth()
@ApiTags('Groups')
@UseGuards(AuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ApiOperation({ summary: 'Create a group within a ledger' })
  @ApiParam({
    name: 'ledgerId',
    type: Number,
    description: 'ID of the ledger where the group will be created',
    example: 10,
  })
  @ApiResponse({
    status: 201,
    description: 'Group created successfully',
    type: GroupResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data or duplicate name' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User or ledger not found' })
  @Post('ledgers/:ledgerId')
  async create(
    @GetUser('id') userId: string,
    @Param('ledgerId', ParseIntPipe) ledgerId: number,
    @Body() createGroupDto: CreateGroupDto,
  ): Promise<GroupResponseDto> {
    return await this.groupsService.create(userId, ledgerId, createGroupDto);
  }

  @ApiOperation({ summary: 'List groups for a ledger' })
  @ApiParam({
    name: 'ledgerId',
    type: Number,
    description: 'ID of the ledger whose groups will be listed',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Groups for the given ledger',
    type: [GroupResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('ledgers/:ledgerId')
  async findAll(
    @Param('ledgerId', ParseIntPipe) ledgerId: number,
  ): Promise<GroupResponseDto[]> {
    return await this.groupsService.findAll(ledgerId);
  }

  @ApiOperation({ summary: 'Get a group by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the group',
    example: 78,
  })
  @ApiResponse({
    status: 200,
    description: 'Group found',
    type: GroupResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GroupResponseDto> {
    return await this.groupsService.findOneById(id);
  }

  @ApiOperation({ summary: 'Find a group by name within a ledger' })
  @ApiParam({
    name: 'ledgerId',
    type: Number,
    description: 'ID of the ledger to search',
    example: 10,
  })
  @ApiQuery({
    name: 'name',
    required: true,
    type: String,
    description: 'Group name to search for',
    example: 'Groceries',
  })
  @ApiResponse({
    status: 200,
    description: 'Group found',
    type: GroupResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @Get('ledgers/:ledgerId/search')
  async findByName(
    @Param('ledgerId', ParseIntPipe) ledgerId: number,
    @Query('name') name: string,
  ): Promise<GroupResponseDto> {
    return await this.groupsService.findByName(ledgerId, name);
  }

  @ApiOperation({ summary: 'Update a group by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the group to update',
    example: 78,
  })
  @ApiResponse({
    status: 200,
    description: 'Group updated successfully',
    type: GroupResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @Patch(':id')
  async update(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<GroupResponseDto> {
    return await this.groupsService.update(userId, id, updateGroupDto);
  }

  @ApiOperation({ summary: 'Delete a group by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the group to delete',
    example: 78,
  })
  @ApiResponse({ status: 204, description: 'Group deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.groupsService.remove(userId, id);
  }
}
