import { CollaborationEntity } from 'src/modules/collaborations/entities/collaboration.entity';
import { CollaborationWithRelations } from 'src/types/entities/entities-with-relations';

export const collaborationToEntity = (
  collaboration: CollaborationWithRelations,
) => {};

export const collaborationEntityToResponseDto = (
  collaboration: CollaborationEntity,
) => {};

export const collaborationArrayToArrayDto = (
  collaborationArray: CollaborationEntity[],
) => {};
