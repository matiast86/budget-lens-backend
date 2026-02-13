import { Collaboration } from 'prisma/generated/prisma/client';
import { CollaborationResponseDto } from 'src/modules/collaborations/dto/collaboration-response.dto';

export const collaborationToResponseDto = (
  collaboration: Collaboration,
): CollaborationResponseDto => {
  const { id, userId, ledgerId } = collaboration;
  return new CollaborationResponseDto({ id, userId, ledgerId });
};

export const collaborationArrayToArrayDto = (
  collaborationArray: Collaboration[],
) => {
  return collaborationArray
    ? collaborationArray.map(collaborationToResponseDto)
    : [];
};
