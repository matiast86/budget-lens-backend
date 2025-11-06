import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CollaborationsService } from './collaborations.service';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { UpdateCollaborationDto } from './dto/update-collaboration.dto';

@Controller('collaborations')
export class CollaborationsController {
  constructor(private readonly collaborationsService: CollaborationsService) {}

  @Post()
  create(@Body() createCollaborationDto: CreateCollaborationDto) {
    return this.collaborationsService.create(createCollaborationDto);
  }

  @Get()
  findAll() {
    return this.collaborationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collaborationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCollaborationDto: UpdateCollaborationDto) {
    return this.collaborationsService.update(+id, updateCollaborationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collaborationsService.remove(+id);
  }
}
