import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  groupArrayToArrayDto,
  groupToResponseDto,
} from 'src/helpers/mappers/group.mapper';
import { LedgersService } from '../ledgers/ledgers.service';
import { UsersService } from '../users/users.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupResponseDto } from './dto/group-response.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsRepository } from './groups.repositories';

@Injectable()
export class GroupsService {
  constructor(
    private readonly groupsRepository: GroupsRepository,
    private readonly ledgersService: LedgersService,
    private readonly usersService: UsersService,
  ) {}
  async create(
    userId: string,
    ledgerId: number,
    createGroupDto: CreateGroupDto,
  ): Promise<GroupResponseDto> {
    const { name } = createGroupDto;
    const user = await this.usersService.findOne(userId);
    const ledger = await this.ledgersService.findOne(ledgerId);
    if (!user || !ledger)
      throw new NotFoundException(`User or ledger not found.`);
    const collaborations = ledger.collaborations;
    const collaboration = collaborations.some((c) => c.userId === userId);
    if (ledger.ownerId !== userId && !collaboration) {
      throw new UnauthorizedException(
        `Only ledger owners or collaborators can add groups.`,
      );
    }
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
    userId: string,
    id: number,
    updateGroupDto: UpdateGroupDto,
  ): Promise<GroupResponseDto> {
    const group = await this.groupsRepository.findById(id);
    if (!group) throw new NotFoundException(`Group with id: ${id} not found`);
    const ledger = await this.ledgersService.findOne(group.ledgerId);
    if (!ledger) throw new NotFoundException(`Ledger not found.`);
    const collaborations = ledger.collaborations;
    const collaboration = collaborations.some((c) => c.userId === userId);
    if (ledger.ownerId !== userId && group.userId !== userId && !collaboration)
      throw new UnauthorizedException(
        `Only ledger owners or collaborators can update groups.`,
      );
    const updated = await this.groupsRepository.update(id, {
      ...updateGroupDto,
    });
    return groupToResponseDto(updated);
  }

  async remove(userId: string, id: number): Promise<void> {
    const group = await this.groupsRepository.findById(id);
    if (!group) throw new NotFoundException(`Group with id: ${id} not found`);
    const ledger = await this.ledgersService.findOne(group.ledgerId);
    if (!ledger) throw new NotFoundException(`Ledger not found.`);
    const collaborations = ledger.collaborations;
    const collaboration = collaborations.some((c) => c.userId === userId);
    if (ledger.ownerId !== userId && group.userId !== userId && !collaboration)
      throw new UnauthorizedException(
        `Only ledger owners or collaborators can update groups.`,
      );
    await this.groupsRepository.delete(id);
  }
}
