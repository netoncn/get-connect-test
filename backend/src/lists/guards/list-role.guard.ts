import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ListRole, ListMember } from '@prisma/client';
import { LIST_ROLES_KEY } from '../decorators/list-roles.decorator';

const ROLE_HIERARCHY: Record<ListRole, number> = {
  [ListRole.OWNER]: 3,
  [ListRole.EDITOR]: 2,
  [ListRole.VIEWER]: 1,
};

interface ListRoleRequest {
  listMembership?: ListMember;
}

@Injectable()
export class ListRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ListRole[]>(
      LIST_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<ListRoleRequest>();
    const membership = request.listMembership;

    if (!membership) {
      throw new ForbiddenException('List membership not found');
    }

    const userRoleLevel = ROLE_HIERARCHY[membership.role];
    const hasRequiredRole = requiredRoles.some(
      (role) => userRoleLevel >= ROLE_HIERARCHY[role],
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException('Insufficient permissions for this action');
    }

    return true;
  }
}
