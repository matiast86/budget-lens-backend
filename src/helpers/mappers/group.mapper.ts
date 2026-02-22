import { Group } from 'prisma/generated/prisma/client';
import { GroupResponseDto } from 'src/modules/groups/dto/group-response.dto';

export const groupToResponseDto = (group: Group): GroupResponseDto => {
  const { id, name, ledgerId, userId } = group;
  return new GroupResponseDto({
    id,
    name,
    ledgerId,
    userId,
  });
};

export const groupArrayToArrayDto = (
  groupArray: Group[],
): GroupResponseDto[] => {
  return groupArray.map(groupToResponseDto);
};
