import { Group } from '@prisma/client';
import { GroupResponseDto } from 'src/modules/groups/dto/group-response.dto';

export const groupToResponseDto = (group: Group): GroupResponseDto => {
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
  groupArray: Group[],
): GroupResponseDto[] => {
  return groupArray.map(groupToResponseDto);
};
