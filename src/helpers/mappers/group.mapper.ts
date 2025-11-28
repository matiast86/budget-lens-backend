import { GroupResponseDto } from 'src/modules/groups/dto/group-response.dto';
import { GroupMinimal } from 'src/types/entities/entities-with-relations';

export const groupToResponseDto = (group: GroupMinimal): GroupResponseDto => {
  const { id, name, ledgerId, userId, isGlobal } = group;
  return new GroupResponseDto({
    id,
    name,
    ledgerId: ledgerId ?? undefined,
    userId,
    isGlobal,
  });
};

export const groupArrayToArrayDto = (
  groupArray: GroupMinimal[],
): GroupResponseDto[] => {
  return groupArray.map(groupToResponseDto);
};
