import { GroupResponseDto } from 'src/modules/groups/dto/group-response.dto';
import { GroupEntity } from 'src/modules/groups/entities/group.entity';
import { GroupMinimal } from 'src/types/entities/entities-with-relations';

export const groupToEntity = (group: GroupMinimal): GroupEntity => {
  const { id, name, ledgerId, userId, isGlobal } = group;

  return new GroupEntity({
    id,
    name,
    ledgerId: ledgerId ?? undefined,
    userId,
    isGlobal,
  });
};

export const groupEntityToResponseDto = (
  group: GroupEntity,
): GroupResponseDto => {
  const { id, name, ledgerId, userId, isGlobal } = group;
  return new GroupResponseDto({ id, name, ledgerId, userId, isGlobal });
};

export const groupArrayToArrayDto = (
  groupArray: GroupEntity[],
): GroupResponseDto[] => {
  return groupArray.map(groupEntityToResponseDto);
};
