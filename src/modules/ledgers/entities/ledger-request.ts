import { Request } from 'express';
import { CollaborationResponseDto } from 'src/modules/collaborations/dto/collaboration-response.dto';
import { DebtOwnerResponseDto } from 'src/modules/debt-owners/dto/debt-owner-response.dto';
import { GroupResponseDto } from 'src/modules/groups/dto/group-response.dto';
import { JwtPayload } from 'src/types/payload/payload';
import { LedgerResponseDto } from '../dto/ledger-response.dto';

export interface LedgerRequest extends Request {
  user?: JwtPayload;
  ledger?: LedgerResponseDto;
  debtOwner?: DebtOwnerResponseDto;
  group?: GroupResponseDto;
  collaboration?: CollaborationResponseDto;
}
