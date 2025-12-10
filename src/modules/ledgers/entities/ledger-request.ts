import { Request } from 'express';
import { JwtPayload } from 'src/types/payload/payload';
import { LedgerResponseDto } from '../dto/ledger-response.dto';

export interface LedgerRequest extends Request {
  user?: JwtPayload;
  ledger?: LedgerResponseDto;
}
