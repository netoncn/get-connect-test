import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateItemDto, UpdateItemDto, ItemResponseDto } from './dto';
import { ListItem, Prisma } from '@prisma/client';

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(listId: string): Promise<ItemResponseDto[]> {
    const items = await this.prisma.listItem.findMany({
      where: { listId },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ done: 'asc' }, { createdAt: 'desc' }],
    });

    return items.map((item) => this.toResponse(item));
  }

  async create(
    listId: string,
    userId: string,
    dto: CreateItemDto,
  ): Promise<ItemResponseDto> {
    const item = await this.prisma.listItem.create({
      data: {
        listId,
        createdById: userId,
        kind: dto.kind,
        title: dto.title,
        notes: dto.notes,
        metadata: dto.metadata as Prisma.InputJsonValue,
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    return this.toResponse(item);
  }

  async update(
    listId: string,
    itemId: string,
    dto: UpdateItemDto,
  ): Promise<ItemResponseDto> {
    const existing = await this.prisma.listItem.findFirst({
      where: { id: itemId, listId },
    });

    if (!existing) {
      throw new NotFoundException('Item not found');
    }

    const item = await this.prisma.listItem.update({
      where: { id: itemId },
      data: {
        title: dto.title,
        notes: dto.notes,
        done: dto.done,
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    return this.toResponse(item);
  }

  async remove(listId: string, itemId: string): Promise<void> {
    const existing = await this.prisma.listItem.findFirst({
      where: { id: itemId, listId },
    });

    if (!existing) {
      throw new NotFoundException('Item not found');
    }

    await this.prisma.listItem.delete({
      where: { id: itemId },
    });
  }

  private toResponse(
    item: ListItem & { createdBy: { id: string; name: string } },
  ): ItemResponseDto {
    return {
      id: item.id,
      listId: item.listId,
      createdById: item.createdById,
      createdByName: item.createdBy.name,
      kind: item.kind,
      title: item.title,
      notes: item.notes ?? undefined,
      done: item.done,
      metadata: (item.metadata as Record<string, unknown>) ?? undefined,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
