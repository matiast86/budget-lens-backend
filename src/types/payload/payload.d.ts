import { Role } from 'prisma/generated/prisma/client';

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  membership?: string;
}
