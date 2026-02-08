import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ListRole } from '@prisma/client';
import { ListsService } from './lists.service';
import { PrismaService } from '../prisma';

const mockPrismaService = {
  list: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  listMember: {
    findMany: jest.fn(),
  },
};

describe('ListsService', () => {
  let service: ListsService;
  let prisma: typeof mockPrismaService;

  const now = new Date('2026-01-15T10:00:00.000Z');

  const userId = 'user-id-1';
  const listId = 'list-id-1';

  const mockListFromCreate = {
    id: listId,
    name: 'Groceries',
    createdById: userId,
    createdAt: now,
    updatedAt: now,
    _count: { items: 0, members: 1 },
  };

  const mockMemberships = [
    {
      id: 'member-id-1',
      listId: 'list-id-1',
      userId,
      role: ListRole.OWNER,
      createdAt: now,
      list: {
        id: 'list-id-1',
        name: 'Groceries',
        createdById: userId,
        createdAt: now,
        updatedAt: now,
        _count: { items: 3, members: 2 },
      },
    },
    {
      id: 'member-id-2',
      listId: 'list-id-2',
      userId,
      role: ListRole.EDITOR,
      createdAt: now,
      list: {
        id: 'list-id-2',
        name: 'Books to Read',
        createdById: 'user-id-2',
        createdAt: now,
        updatedAt: now,
        _count: { items: 5, members: 3 },
      },
    },
  ];

  const mockListDetail = {
    id: listId,
    name: 'Groceries',
    createdById: userId,
    createdAt: now,
    updatedAt: now,
    members: [
      {
        id: 'member-id-1',
        listId,
        userId,
        role: ListRole.OWNER,
        createdAt: now,
        user: { id: userId, name: 'Alice', email: 'alice@example.com' },
      },
      {
        id: 'member-id-3',
        listId,
        userId: 'user-id-2',
        role: ListRole.VIEWER,
        createdAt: now,
        user: { id: 'user-id-2', name: 'Bob', email: 'bob@example.com' },
      },
    ],
    _count: { items: 3, members: 2 },
  };

  const mockUpdatedList = {
    id: listId,
    name: 'Updated Groceries',
    createdById: userId,
    createdAt: now,
    updatedAt: new Date('2026-01-16T12:00:00.000Z'),
    members: [
      {
        id: 'member-id-1',
        listId,
        userId,
        role: ListRole.OWNER,
        createdAt: now,
      },
    ],
    _count: { items: 3, members: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ListsService>(ListsService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create list with OWNER membership', async () => {
      prisma.list.create.mockResolvedValue(mockListFromCreate);

      const result = await service.create(userId, { name: 'Groceries' });

      expect(prisma.list.create).toHaveBeenCalledWith({
        data: {
          name: 'Groceries',
          createdById: userId,
          members: { create: { userId, role: ListRole.OWNER } },
        },
        include: { _count: { select: { items: true, members: true } } },
      });

      expect(result).toEqual({
        id: listId,
        name: 'Groceries',
        createdById: userId,
        createdAt: now,
        updatedAt: now,
        userRole: ListRole.OWNER,
        itemCount: 0,
        memberCount: 1,
      });
    });

    it('should set userRole to OWNER', async () => {
      prisma.list.create.mockResolvedValue(mockListFromCreate);

      const result = await service.create(userId, { name: 'Groceries' });

      expect(result.userRole).toBe(ListRole.OWNER);
    });
  });

  describe('findAll', () => {
    it('should return all lists for user', async () => {
      prisma.listMember.findMany.mockResolvedValue(mockMemberships);

      const result = await service.findAll(userId);

      expect(prisma.listMember.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          list: {
            include: { _count: { select: { items: true, members: true } } },
          },
        },
        orderBy: { list: { updatedAt: 'desc' } },
      });

      expect(result).toHaveLength(2);

      expect(result[0]).toEqual({
        id: 'list-id-1',
        name: 'Groceries',
        createdById: userId,
        createdAt: now,
        updatedAt: now,
        userRole: ListRole.OWNER,
        itemCount: 3,
        memberCount: 2,
      });

      expect(result[1]).toEqual({
        id: 'list-id-2',
        name: 'Books to Read',
        createdById: 'user-id-2',
        createdAt: now,
        updatedAt: now,
        userRole: ListRole.EDITOR,
        itemCount: 5,
        memberCount: 3,
      });
    });

    it('should return empty array when no memberships', async () => {
      prisma.listMember.findMany.mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return list detail with members', async () => {
      prisma.list.findUnique.mockResolvedValue(mockListDetail);

      const result = await service.findOne(listId, userId);

      expect(prisma.list.findUnique).toHaveBeenCalledWith({
        where: { id: listId },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
          _count: { select: { items: true, members: true } },
        },
      });

      expect(result).toEqual({
        id: listId,
        name: 'Groceries',
        createdById: userId,
        createdAt: now,
        updatedAt: now,
        userRole: ListRole.OWNER,
        itemCount: 3,
        memberCount: 2,
        members: [
          {
            id: 'member-id-1',
            userId,
            userName: 'Alice',
            userEmail: 'alice@example.com',
            role: ListRole.OWNER,
            createdAt: now,
          },
          {
            id: 'member-id-3',
            userId: 'user-id-2',
            userName: 'Bob',
            userEmail: 'bob@example.com',
            role: ListRole.VIEWER,
            createdAt: now,
          },
        ],
      });
    });

    it('should throw NotFoundException when list not found', async () => {
      prisma.list.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id', userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id', userId)).rejects.toThrow(
        'List not found',
      );
    });
  });

  describe('update', () => {
    it('should update list name', async () => {
      prisma.list.update.mockResolvedValue(mockUpdatedList);

      const result = await service.update(listId, {
        name: 'Updated Groceries',
      });

      expect(prisma.list.update).toHaveBeenCalledWith({
        where: { id: listId },
        data: { name: 'Updated Groceries' },
        include: {
          members: true,
          _count: { select: { items: true, members: true } },
        },
      });

      expect(result).toEqual({
        id: listId,
        name: 'Updated Groceries',
        createdById: userId,
        createdAt: now,
        updatedAt: mockUpdatedList.updatedAt,
        userRole: ListRole.OWNER,
        itemCount: 3,
        memberCount: 1,
      });
    });
  });

  describe('remove', () => {
    it('should delete list', async () => {
      prisma.list.delete.mockResolvedValue({ id: listId });

      await service.remove(listId);

      expect(prisma.list.delete).toHaveBeenCalledWith({
        where: { id: listId },
      });
    });
  });
});
