import { BadRequestException, Injectable } from '@nestjs/common';
import { Collaboration } from 'prisma/generated/prisma/client';
import { CollaborationUpdateInput } from 'prisma/generated/prisma/models';
import { handleP2025 } from 'src/helpers/errors';
import {
  collaborationArrayToArrayDto,
  collaborationToResponseDto,
} from 'src/helpers/mappers/collaboration.mapper';
import { LedgersService } from '../ledgers/ledgers.service';
import { UsersService } from '../users/users.service';
import { CollaborationsRepository } from './collaborations.repository';
import { CollaborationResponseDto } from './dto/collaboration-response.dto';
import { UpdateCollaborationDto } from './dto/update-collaboration.dto';

@Injectable()
export class CollaborationsService {
  constructor(
    private readonly collaborationsRepository: CollaborationsRepository,
    private readonly ledgersService: LedgersService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    ledgerId: number,
    userId: string,
  ): Promise<CollaborationResponseDto> {
    const exists = await this.collaborationsRepository.findUniqueNullable(
      ledgerId,
      userId,
    );
    if (exists) throw new BadRequestException(`Collaboration exists.`);
    const ledger = await this.ledgersService.findOne(ledgerId);
    const user = await this.usersService.findOne(userId);
    const name = `${user.name} - ${ledger.name}`;
    const collaboration = await this.collaborationsRepository.addCollaboration({
      name,
      user: { connect: { id: userId } },
      ledger: { connect: { id: ledgerId } },
    });
    return collaborationToResponseDto(collaboration);
  }

  async findAllByUserId(userId: string): Promise<CollaborationResponseDto[]> {
    const collaborations =
      await this.collaborationsRepository.findAllByUserId(userId);
    return collaborationArrayToArrayDto(collaborations);
  }

  async findAllByLedgerId(
    ledgerId: number,
  ): Promise<CollaborationResponseDto[]> {
    const collaborations =
      await this.collaborationsRepository.findAllByLedgerId(ledgerId);
    return collaborationArrayToArrayDto(collaborations);
  }

  async findOne(id: number): Promise<CollaborationResponseDto> {
    const collaboration: Collaboration =
      await this.collaborationsRepository.findById(id);
    return collaborationToResponseDto(collaboration);
  }

  async update(
    id: number,
    updateCollaborationDto: UpdateCollaborationDto,
  ): Promise<CollaborationResponseDto> {
    return await this.collaborationsRepository
      .update(id, {
        ...updateCollaborationDto,
      })
      .catch(handleP2025(`Collaboration with id: ${id} not found.`))
      .then(collaborationToResponseDto);
  }

  async remove(id: number): Promise<void> {
    const data: CollaborationUpdateInput = { isActive: false };
    await this.collaborationsRepository
      .update(id, data)
      .catch(handleP2025(`Collaboration with id: ${id} not found.`));
  }

  async reactivateCollaboration(id: number): Promise<void> {
    const collaboration = await this.collaborationsRepository.findById(id);
    if (collaboration.isActive)
      throw new BadRequestException(`Collaboration is already active`);
    await this.collaborationsRepository
      .update(id, { isActive: true })
      .catch(handleP2025(`Collaboration with id: ${id} not found.`));
  }
}
