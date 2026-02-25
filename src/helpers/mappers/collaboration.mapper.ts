import { Collaboration } from 'prisma/generated/prisma/client';
import { CollaborationResponseDto } from 'src/modules/collaborations/dto/collaboration-response.dto';

export const collaborationToResponseDto = (
  collaboration: Collaboration,
): CollaborationResponseDto => {
  const { id, name, isActive, userId, ledgerId } = collaboration;
  return new CollaborationResponseDto({ id, name, isActive, userId, ledgerId });
};

export const collaborationArrayToArrayDto = (
  collaborationArray: Collaboration[],
) => {
  return collaborationArray.map(collaborationToResponseDto);
};
