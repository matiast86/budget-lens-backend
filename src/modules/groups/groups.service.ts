import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  groupArrayToArrayDto,
  groupToResponseDto,
} from 'src/helpers/mappers/group.mapper';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupResponseDto } from './dto/group-response.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsRepository } from './groups.repositories';

@Injectable()
export class GroupsService {
  constructor(private readonly groupsRepository: GroupsRepository) {}
  async create(
    userId: string,
    ledgerId: number,
    createGroupDto: CreateGroupDto,
  ): Promise<GroupResponseDto> {
    const { name } = createGroupDto;

    if (await this.groupsRepository.findByName(ledgerId, name)) {
      throw new BadRequestException(`Group named ${name} is already in use`);
    }

    const group = await this.groupsRepository.create({
      name,
      user: { connect: { id: userId } },
      ledger: { connect: { id: ledgerId } },
    });

    return groupToResponseDto(group);
  }

  async findAll(ledgerId: number): Promise<GroupResponseDto[]> {
    const groups = await this.groupsRepository.findAllByLedgerId(ledgerId);
    return groupArrayToArrayDto(groups);
  }

  async findOneById(id: number): Promise<GroupResponseDto> {
    const group = await this.groupsRepository.findById(id);
    if (!group) throw new NotFoundException(`Group with id: ${id} not found`);

    return groupToResponseDto(group);
  }

  async findByName(ledgerId: number, name: string): Promise<GroupResponseDto> {
    const group = await this.groupsRepository.findByName(ledgerId, name);
    if (!group)
      throw new NotFoundException(`Group with name: ${name} not found`);

    return groupToResponseDto(group);
  }

  async update(
    id: number,
    updateGroupDto: UpdateGroupDto,
  ): Promise<GroupResponseDto> {
    const updated = await this.groupsRepository.update(id, {
      ...updateGroupDto,
    });
    return groupToResponseDto(updated);
  }

  async remove(id: number): Promise<void> {
    await this.groupsRepository.delete(id);
  }

  async findEntityById(id: number): Promise<GroupResponseDto | undefined> {
    const group = await this.groupsRepository.findById(id);

    return group ? groupToResponseDto(group) : undefined;
  }
}
