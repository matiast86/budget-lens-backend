import { CollaborationResponseDto } from 'src/modules/collaborations/dto/collaboration-response.dto';
import { CollaborationEntity } from 'src/modules/collaborations/entities/collaboration.entity';
import { CollaborationWithRelations } from 'src/types/entities/entities-with-relations';

export const collaborationToEntity = (
  collaboration: CollaborationWithRelations,
): CollaborationEntity => {
  const { id, role, userId, ledgerId } = collaboration;
  return new CollaborationEntity({ id, role, userId, ledgerId });
};

export const collaborationEntityToResponseDto = (
  collaboration: CollaborationEntity,
): CollaborationResponseDto => {
  const { id, role, userId, ledgerId } = collaboration;
  return new CollaborationResponseDto({ id, role, userId, ledgerId });
};

export const collaborationArrayToArrayDto = (
  collaborationArray: CollaborationEntity[],
) => {
  return collaborationArray.map(collaborationEntityToResponseDto);
};
