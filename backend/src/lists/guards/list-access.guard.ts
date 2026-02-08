import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { List, ListMember, User } from '@prisma/client';
import { PrismaService } from '../../prisma';

interface ListAccessRequest {
  user: User;
  params: { listId?: string };
  list?: List & { members: ListMember[] };
  listMembership?: ListMember;
}

@Injectable()
export class ListAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ListAccessRequest>();
    const user = request.user;
    const listId = request.params.listId;

    if (!listId) {
      return true;
    }

    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      include: {
        members: {
          where: { userId: user.id },
        },
      },
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    const membership = list.members[0];

    if (!membership) {
      throw new ForbiddenException('You are not a member of this list');
    }

    request.list = list;
    request.listMembership = membership;

    return true;
  }
}
