import { Injectable, NotFoundException } from '@nestjs/common';
import { ListRole } from '@prisma/client';
import { PrismaService } from '../prisma';
import {
  CreateListDto,
  UpdateListDto,
  ListResponseDto,
  ListDetailResponseDto,
  ListMemberResponseDto,
} from './dto';

@Injectable()
export class ListsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateListDto): Promise<ListResponseDto> {
    const list = await this.prisma.list.create({
      data: {
        name: dto.name,
        createdById: userId,
        members: {
          create: {
            userId,
            role: ListRole.OWNER,
          },
        },
      },
      include: {
        _count: {
          select: { items: true, members: true },
        },
      },
    });

    return {
      id: list.id,
      name: list.name,
      createdById: list.createdById,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      userRole: ListRole.OWNER,
      itemCount: list._count.items,
      memberCount: list._count.members,
    };
  }

  async findAll(userId: string): Promise<ListResponseDto[]> {
    const memberships = await this.prisma.listMember.findMany({
      where: { userId },
      include: {
        list: {
          include: {
            _count: {
              select: { items: true, members: true },
            },
          },
        },
      },
      orderBy: {
        list: { updatedAt: 'desc' },
      },
    });

    return memberships.map((membership) => ({
      id: membership.list.id,
      name: membership.list.name,
      createdById: membership.list.createdById,
      createdAt: membership.list.createdAt,
      updatedAt: membership.list.updatedAt,
      userRole: membership.role,
      itemCount: membership.list._count.items,
      memberCount: membership.list._count.members,
    }));
  }

  async findOne(
    listId: string,
    userId: string,
  ): Promise<ListDetailResponseDto> {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { items: true, members: true },
        },
      },
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    const userMembership = list.members.find((m) => m.userId === userId);

    const members: ListMemberResponseDto[] = list.members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      userName: m.user.name,
      userEmail: m.user.email,
      role: m.role,
      createdAt: m.createdAt,
    }));

    return {
      id: list.id,
      name: list.name,
      createdById: list.createdById,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      userRole: userMembership?.role ?? ListRole.VIEWER,
      itemCount: list._count.items,
      memberCount: list._count.members,
      members,
    };
  }

  async update(listId: string, dto: UpdateListDto): Promise<ListResponseDto> {
    const list = await this.prisma.list.update({
      where: { id: listId },
      data: { name: dto.name },
      include: {
        members: true,
        _count: {
          select: { items: true, members: true },
        },
      },
    });

    return {
      id: list.id,
      name: list.name,
      createdById: list.createdById,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      userRole: ListRole.OWNER,
      itemCount: list._count.items,
      memberCount: list._count.members,
    };
  }

  async remove(listId: string): Promise<void> {
    await this.prisma.list.delete({
      where: { id: listId },
    });
  }
}
