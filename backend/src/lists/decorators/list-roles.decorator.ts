import { SetMetadata } from '@nestjs/common';
import { ListRole } from '@prisma/client';

export const LIST_ROLES_KEY = 'listRoles';
export const ListRoles = (...roles: ListRole[]) =>
  SetMetadata(LIST_ROLES_KEY, roles);
