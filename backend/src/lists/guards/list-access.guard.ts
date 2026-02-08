import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma';

@Injectable()
export class ListAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
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
