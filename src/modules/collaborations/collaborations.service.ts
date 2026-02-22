import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Collaboration } from 'prisma/generated/prisma/client';
import { CollaborationUpdateInput } from 'prisma/generated/prisma/models';
import {
  collaborationArrayToArrayDto,
  collaborationToResponseDto,
} from 'src/helpers/mappers/collaboration.mapper';
import { LedgerResponseDto } from '../ledgers/dto/ledger-response.dto';
import { UsersService } from '../users/users.service';
import { CollaborationsRepository } from './collaborations.repository';
import { CollaborationResponseDto } from './dto/collaboration-response.dto';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { UpdateCollaborationDto } from './dto/update-collaboration.dto';

@Injectable()
export class CollaborationsService {
  constructor(
    private readonly collaborationsRepository: CollaborationsRepository,
    private readonly usersService: UsersService,
  ) {}

  async create(
    ledger: LedgerResponseDto,
    createCollaborationDto: CreateCollaborationDto,
  ): Promise<CollaborationResponseDto> {
    const { email } = createCollaborationDto;
    const user = await this.usersService.findOneByEmail(email);
    const exists = await this.collaborationsRepository.findUniqueNullable(
      ledger.id,
      user.id,
    );
    if (exists) throw new BadRequestException(`Collaboration exists.`);
    const name = `${user.name} - ${ledger.name}`;
    const collaboration = await this.collaborationsRepository.addCollaboration({
      name,
      user: { connect: { id: user.id } },
      ledger: { connect: { id: ledger.id } },
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
    const collaboration: Collaboration | null =
      await this.collaborationsRepository.findById(id);
    if (!collaboration)
      throw new NotFoundException(`Collaboration with id: ${id} not found.`);
    return collaborationToResponseDto(collaboration);
  }

  async update(
    id: number,
    updateCollaborationDto: UpdateCollaborationDto,
  ): Promise<CollaborationResponseDto> {
    const updated = await this.collaborationsRepository.update(id, {
      ...updateCollaborationDto,
    });

    return collaborationToResponseDto(updated);
  }

  async remove(id: number): Promise<void> {
    const data: CollaborationUpdateInput = { isActive: false };
    await this.collaborationsRepository.update(id, data);
  }

  async reactivateCollaboration(id: number): Promise<void> {
    await this.collaborationsRepository.update(id, {
      isActive: true,
    });
  }

  async findEntityById(id: number): Promise<Collaboration | null> {
    return await this.collaborationsRepository.findById(id);
  }
}
