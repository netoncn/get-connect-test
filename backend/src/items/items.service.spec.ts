import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ItemsService } from './items.service';
import { PrismaService } from '../prisma';

const now = new Date('2025-06-01T00:00:00.000Z');

const mockCreatedBy = { id: 'user-uuid-1', name: 'Alice' };

const mockItem = {
  id: 'item-uuid-1',
  listId: 'list-uuid-1',
  createdById: 'user-uuid-1',
  createdBy: mockCreatedBy,
  kind: 'BOOK' as const,
  title: 'The Great Gatsby',
  notes: 'Must read this summer',
  done: false,
  metadata: null,
  createdAt: now,
  updatedAt: now,
};

const mockItemWithMetadata = {
  ...mockItem,
  id: 'item-uuid-2',
  metadata: { source: 'google', authors: ['F. Scott Fitzgerald'], isbn: '123' },
};

const mockPrismaService = {
  listItem: {
    findMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ItemsService', () => {
  let service: ItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all items for a list', async () => {
      const secondItem = {
        ...mockItem,
        id: 'item-uuid-3',
        title: 'Another Book',
        notes: null,
      };
      mockPrismaService.listItem.findMany.mockResolvedValue([
        mockItem,
        secondItem,
      ]);

      const result = await service.findAll('list-uuid-1');

      expect(mockPrismaService.listItem.findMany).toHaveBeenCalledWith({
        where: { listId: 'list-uuid-1' },
        include: {
          createdBy: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ done: 'asc' }, { createdAt: 'desc' }],
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: mockItem.id,
        listId: mockItem.listId,
        createdById: mockItem.createdById,
        createdByName: mockCreatedBy.name,
        kind: mockItem.kind,
        title: mockItem.title,
        notes: mockItem.notes,
        done: mockItem.done,
        metadata: undefined,
        createdAt: mockItem.createdAt,
        updatedAt: mockItem.updatedAt,
      });
      expect(result[1]).toEqual(
        expect.objectContaining({
          id: 'item-uuid-3',
          title: 'Another Book',
          notes: undefined,
        }),
      );
    });

    it('should return empty array when no items', async () => {
      mockPrismaService.listItem.findMany.mockResolvedValue([]);

      const result = await service.findAll('list-uuid-empty');

      expect(mockPrismaService.listItem.findMany).toHaveBeenCalledWith({
        where: { listId: 'list-uuid-empty' },
        include: {
          createdBy: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ done: 'asc' }, { createdAt: 'desc' }],
      });
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create an item and return response', async () => {
      mockPrismaService.listItem.create.mockResolvedValue(mockItem);

      const dto = {
        kind: 'BOOK' as const,
        title: 'The Great Gatsby',
        notes: 'Must read this summer',
      };
      const result = await service.create('list-uuid-1', 'user-uuid-1', dto);

      expect(mockPrismaService.listItem.create).toHaveBeenCalledWith({
        data: {
          listId: 'list-uuid-1',
          createdById: 'user-uuid-1',
          kind: 'BOOK',
          title: 'The Great Gatsby',
          notes: 'Must read this summer',
          metadata: undefined,
        },
        include: {
          createdBy: {
            select: { id: true, name: true },
          },
        },
      });
      expect(result).toEqual({
        id: mockItem.id,
        listId: mockItem.listId,
        createdById: mockItem.createdById,
        createdByName: mockCreatedBy.name,
        kind: 'BOOK',
        title: 'The Great Gatsby',
        notes: 'Must read this summer',
        done: false,
        metadata: undefined,
        createdAt: now,
        updatedAt: now,
      });
    });

    it('should handle metadata as JSON', async () => {
      mockPrismaService.listItem.create.mockResolvedValue(mockItemWithMetadata);

      const dto = {
        kind: 'BOOK' as const,
        title: 'The Great Gatsby',
        metadata: {
          source: 'google',
          authors: ['F. Scott Fitzgerald'],
          isbn: '123',
        },
      };
      const result = await service.create('list-uuid-1', 'user-uuid-1', dto);

      expect(mockPrismaService.listItem.create).toHaveBeenCalledWith({
        data: {
          listId: 'list-uuid-1',
          createdById: 'user-uuid-1',
          kind: 'BOOK',
          title: 'The Great Gatsby',
          notes: undefined,
          metadata: {
            source: 'google',
            authors: ['F. Scott Fitzgerald'],
            isbn: '123',
          },
        },
        include: {
          createdBy: {
            select: { id: true, name: true },
          },
        },
      });
      expect(result.metadata).toEqual({
        source: 'google',
        authors: ['F. Scott Fitzgerald'],
        isbn: '123',
      });
    });
  });

  describe('update', () => {
    it('should update existing item', async () => {
      const updatedItem = { ...mockItem, title: 'Updated Title', done: true };
      mockPrismaService.listItem.findFirst.mockResolvedValue(mockItem);
      mockPrismaService.listItem.update.mockResolvedValue(updatedItem);

      const dto = { title: 'Updated Title', done: true };
      const result = await service.update('list-uuid-1', 'item-uuid-1', dto);

      expect(mockPrismaService.listItem.findFirst).toHaveBeenCalledWith({
        where: { id: 'item-uuid-1', listId: 'list-uuid-1' },
      });
      expect(mockPrismaService.listItem.update).toHaveBeenCalledWith({
        where: { id: 'item-uuid-1' },
        data: {
          title: 'Updated Title',
          notes: undefined,
          done: true,
        },
        include: {
          createdBy: {
            select: { id: true, name: true },
          },
        },
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: 'item-uuid-1',
          title: 'Updated Title',
          done: true,
        }),
      );
    });

    it('should throw NotFoundException when item not found', async () => {
      mockPrismaService.listItem.findFirst.mockResolvedValue(null);

      await expect(
        service.update('list-uuid-1', 'nonexistent-id', { title: 'Nope' }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update('list-uuid-1', 'nonexistent-id', { title: 'Nope' }),
      ).rejects.toThrow('Item not found');
      expect(mockPrismaService.listItem.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete item', async () => {
      mockPrismaService.listItem.findFirst.mockResolvedValue(mockItem);
      mockPrismaService.listItem.delete.mockResolvedValue(mockItem);

      await service.remove('list-uuid-1', 'item-uuid-1');

      expect(mockPrismaService.listItem.findFirst).toHaveBeenCalledWith({
        where: { id: 'item-uuid-1', listId: 'list-uuid-1' },
      });
      expect(mockPrismaService.listItem.delete).toHaveBeenCalledWith({
        where: { id: 'item-uuid-1' },
      });
    });

    it('should throw NotFoundException when item not found', async () => {
      mockPrismaService.listItem.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('list-uuid-1', 'nonexistent-id'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.remove('list-uuid-1', 'nonexistent-id'),
      ).rejects.toThrow('Item not found');
      expect(mockPrismaService.listItem.delete).not.toHaveBeenCalled();
    });
  });
});
