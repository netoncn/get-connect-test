import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ListRole } from '@prisma/client';
import { InvitesService } from './invites.service';
import { PrismaService } from '../prisma';

const mockPrismaService = {
  listMember: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  listInvite: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
};

const now = new Date('2025-06-01T12:00:00.000Z');
const futureDate = new Date('2099-06-08T12:00:00.000Z');
const pastDate = new Date('2025-05-20T12:00:00.000Z');

const mockUser = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  passwordHash: 'hashed',
  createdAt: now,
  updatedAt: now,
};

const mockTargetUser = {
  id: 'user-2',
  name: 'Jane Smith',
  email: 'jane@example.com',
  passwordHash: 'hashed',
  createdAt: now,
  updatedAt: now,
};

const mockList = {
  id: 'list-1',
  name: 'Shopping List',
  createdById: 'user-1',
  createdAt: now,
  updatedAt: now,
};

describe('InvitesService', () => {
  let service: InvitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InvitesService>(InvitesService);

    jest.clearAllMocks();
  });

  describe('getMembers', () => {
    it('should return members of a list', async () => {
      const members = [
        {
          id: 'member-1',
          listId: 'list-1',
          userId: 'user-1',
          role: ListRole.OWNER,
          createdAt: now,
          user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
        },
        {
          id: 'member-2',
          listId: 'list-1',
          userId: 'user-2',
          role: ListRole.VIEWER,
          createdAt: now,
          user: { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
        },
      ];

      mockPrismaService.listMember.findMany.mockResolvedValue(members);

      const result = await service.getMembers('list-1');

      expect(mockPrismaService.listMember.findMany).toHaveBeenCalledWith({
        where: { listId: 'list-1' },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual([
        {
          id: 'member-1',
          userId: 'user-1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          role: ListRole.OWNER,
          createdAt: now,
        },
        {
          id: 'member-2',
          userId: 'user-2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          role: ListRole.VIEWER,
          createdAt: now,
        },
      ]);
    });
  });

  describe('createInvite', () => {
    it('should create invite with default VIEWER role', async () => {
      const dto = { email: 'jane@example.com' };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.listInvite.findFirst.mockResolvedValue(null);
      mockPrismaService.listInvite.create.mockResolvedValue({
        id: 'invite-1',
        listId: 'list-1',
        email: 'jane@example.com',
        token: 'some-uuid',
        role: ListRole.VIEWER,
        expiresAt: futureDate,
        acceptedAt: null,
        createdById: 'user-1',
        createdAt: now,
      });

      const result = await service.createInvite('list-1', 'user-1', dto);

      expect(mockPrismaService.listInvite.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          listId: 'list-1',
          email: 'jane@example.com',
          role: ListRole.VIEWER,
          createdById: 'user-1',
        }),
      });
      expect(result).toEqual({
        id: 'invite-1',
        listId: 'list-1',
        email: 'jane@example.com',
        role: ListRole.VIEWER,
        expiresAt: futureDate,
        acceptedAt: undefined,
        createdAt: futureDate,
      });
    });

    it('should throw ConflictException when user is already a member', async () => {
      const dto = { email: 'jane@example.com' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockTargetUser);
      mockPrismaService.listMember.findUnique.mockResolvedValue({
        id: 'member-2',
        listId: 'list-1',
        userId: 'user-2',
        role: ListRole.VIEWER,
      });

      await expect(
        service.createInvite('list-1', 'user-1', dto),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.createInvite('list-1', 'user-1', dto),
      ).rejects.toThrow('User is already a member of this list');
    });

    it('should throw ConflictException when active invite exists', async () => {
      const dto = { email: 'jane@example.com' };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.listInvite.findFirst.mockResolvedValue({
        id: 'invite-existing',
        listId: 'list-1',
        email: 'jane@example.com',
        expiresAt: futureDate,
        acceptedAt: null,
      });

      await expect(
        service.createInvite('list-1', 'user-1', dto),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.createInvite('list-1', 'user-1', dto),
      ).rejects.toThrow('An active invite already exists for this email');
    });

    it('should lowercase the email', async () => {
      const dto = { email: 'Jane@EXAMPLE.com' };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.listInvite.findFirst.mockResolvedValue(null);
      mockPrismaService.listInvite.create.mockResolvedValue({
        id: 'invite-1',
        listId: 'list-1',
        email: 'jane@example.com',
        token: 'some-uuid',
        role: ListRole.VIEWER,
        expiresAt: futureDate,
        acceptedAt: null,
        createdById: 'user-1',
        createdAt: now,
      });

      await service.createInvite('list-1', 'user-1', dto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'jane@example.com' },
      });
      expect(mockPrismaService.listInvite.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'jane@example.com',
        }),
      });
    });
  });

  describe('acceptInvite', () => {
    const validInvite = {
      id: 'invite-1',
      listId: 'list-1',
      email: 'john@example.com',
      token: 'valid-token',
      role: ListRole.VIEWER,
      expiresAt: futureDate,
      acceptedAt: null,
      createdById: 'user-2',
      list: mockList,
    };

    it('should accept invite and create membership', async () => {
      mockPrismaService.listInvite.findUnique.mockResolvedValue(validInvite);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.listMember.findUnique.mockResolvedValue(null);
      mockPrismaService.$transaction.mockResolvedValue([{}, {}]);

      const result = await service.acceptInvite('valid-token', 'user-1');

      expect(mockPrismaService.listInvite.findUnique).toHaveBeenCalledWith({
        where: { token: 'valid-token' },
        include: { list: true },
      });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Invite accepted successfully',
        listId: 'list-1',
        listName: 'Shopping List',
      });
    });

    it('should throw NotFoundException for invalid token', async () => {
      mockPrismaService.listInvite.findUnique.mockResolvedValue(null);

      await expect(
        service.acceptInvite('invalid-token', 'user-1'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.acceptInvite('invalid-token', 'user-1'),
      ).rejects.toThrow('Invite not found');
    });

    it('should throw BadRequestException when already accepted', async () => {
      mockPrismaService.listInvite.findUnique.mockResolvedValue({
        ...validInvite,
        acceptedAt: now,
      });

      await expect(
        service.acceptInvite('valid-token', 'user-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.acceptInvite('valid-token', 'user-1'),
      ).rejects.toThrow('Invite has already been accepted');
    });

    it('should throw BadRequestException when expired', async () => {
      mockPrismaService.listInvite.findUnique.mockResolvedValue({
        ...validInvite,
        expiresAt: pastDate,
      });

      await expect(
        service.acceptInvite('valid-token', 'user-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.acceptInvite('valid-token', 'user-1'),
      ).rejects.toThrow('Invite has expired');
    });

    it('should throw ForbiddenException when email does not match', async () => {
      mockPrismaService.listInvite.findUnique.mockResolvedValue(validInvite);
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        email: 'different@example.com',
      });

      await expect(
        service.acceptInvite('valid-token', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.acceptInvite('valid-token', 'user-1'),
      ).rejects.toThrow('This invite is for a different email address');
    });

    it('should throw ConflictException when already a member', async () => {
      mockPrismaService.listInvite.findUnique.mockResolvedValue(validInvite);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.listMember.findUnique.mockResolvedValue({
        id: 'member-1',
        listId: 'list-1',
        userId: 'user-1',
        role: ListRole.VIEWER,
      });

      await expect(
        service.acceptInvite('valid-token', 'user-1'),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.acceptInvite('valid-token', 'user-1'),
      ).rejects.toThrow('You are already a member of this list');
    });
  });

  describe('updateMemberRole', () => {
    it('should update role successfully', async () => {
      const membership = {
        id: 'member-2',
        listId: 'list-1',
        userId: 'user-2',
        role: ListRole.VIEWER,
        createdAt: now,
        user: { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
      };
      const updatedMembership = {
        ...membership,
        role: ListRole.EDITOR,
      };

      mockPrismaService.listMember.findUnique.mockResolvedValue(membership);
      mockPrismaService.listMember.update.mockResolvedValue(updatedMembership);

      const result = await service.updateMemberRole('list-1', 'user-2', {
        role: 'EDITOR',
      });

      expect(mockPrismaService.listMember.findUnique).toHaveBeenCalledWith({
        where: { listId_userId: { listId: 'list-1', userId: 'user-2' } },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      expect(mockPrismaService.listMember.update).toHaveBeenCalledWith({
        where: { id: 'member-2' },
        data: { role: 'EDITOR' },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      expect(result).toEqual({
        id: 'member-2',
        userId: 'user-2',
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        role: ListRole.EDITOR,
        createdAt: now,
      });
    });

    it('should throw NotFoundException when member not found', async () => {
      mockPrismaService.listMember.findUnique.mockResolvedValue(null);

      await expect(
        service.updateMemberRole('list-1', 'user-999', { role: 'EDITOR' }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateMemberRole('list-1', 'user-999', { role: 'EDITOR' }),
      ).rejects.toThrow('Member not found');
    });

    it('should throw ForbiddenException when changing owner role', async () => {
      const ownerMembership = {
        id: 'member-1',
        listId: 'list-1',
        userId: 'user-1',
        role: ListRole.OWNER,
        createdAt: now,
        user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
      };

      mockPrismaService.listMember.findUnique.mockResolvedValue(
        ownerMembership,
      );

      await expect(
        service.updateMemberRole('list-1', 'user-1', { role: 'EDITOR' }),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateMemberRole('list-1', 'user-1', { role: 'EDITOR' }),
      ).rejects.toThrow('Cannot change the role of the list owner');
      expect(mockPrismaService.listMember.update).not.toHaveBeenCalled();
    });
  });

  describe('removeMember', () => {
    it('should remove member successfully', async () => {
      const membership = {
        id: 'member-2',
        listId: 'list-1',
        userId: 'user-2',
        role: ListRole.VIEWER,
      };

      mockPrismaService.listMember.findUnique.mockResolvedValue(membership);
      mockPrismaService.listMember.delete.mockResolvedValue(membership);

      await service.removeMember('list-1', 'user-2');

      expect(mockPrismaService.listMember.findUnique).toHaveBeenCalledWith({
        where: { listId_userId: { listId: 'list-1', userId: 'user-2' } },
      });
      expect(mockPrismaService.listMember.delete).toHaveBeenCalledWith({
        where: { id: 'member-2' },
      });
    });

    it('should throw ForbiddenException when removing owner', async () => {
      const ownerMembership = {
        id: 'member-1',
        listId: 'list-1',
        userId: 'user-1',
        role: ListRole.OWNER,
      };

      mockPrismaService.listMember.findUnique.mockResolvedValue(
        ownerMembership,
      );

      await expect(service.removeMember('list-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.removeMember('list-1', 'user-1')).rejects.toThrow(
        'Cannot remove the list owner',
      );
      expect(mockPrismaService.listMember.delete).not.toHaveBeenCalled();
    });
  });

  describe('getPendingInvites', () => {
    it('should return pending invites', async () => {
      const invites = [
        {
          id: 'invite-1',
          listId: 'list-1',
          email: 'jane@example.com',
          role: ListRole.VIEWER,
          expiresAt: futureDate,
          acceptedAt: null,
          createdAt: now,
        },
        {
          id: 'invite-2',
          listId: 'list-1',
          email: 'bob@example.com',
          role: ListRole.EDITOR,
          expiresAt: futureDate,
          acceptedAt: null,
          createdAt: now,
        },
      ];

      mockPrismaService.listInvite.findMany.mockResolvedValue(invites);

      const result = await service.getPendingInvites('list-1');

      expect(mockPrismaService.listInvite.findMany).toHaveBeenCalledWith({
        where: {
          listId: 'list-1',
          acceptedAt: null,
          expiresAt: { gt: expect.any(Date) },
        },
        orderBy: { expiresAt: 'asc' },
      });
      expect(result).toEqual([
        {
          id: 'invite-1',
          listId: 'list-1',
          email: 'jane@example.com',
          role: ListRole.VIEWER,
          expiresAt: futureDate,
          acceptedAt: undefined,
          createdAt: futureDate,
        },
        {
          id: 'invite-2',
          listId: 'list-1',
          email: 'bob@example.com',
          role: ListRole.EDITOR,
          expiresAt: futureDate,
          acceptedAt: undefined,
          createdAt: futureDate,
        },
      ]);
    });
  });

  describe('cancelInvite', () => {
    it('should delete invite', async () => {
      const invite = {
        id: 'invite-1',
        listId: 'list-1',
        email: 'jane@example.com',
      };

      mockPrismaService.listInvite.findFirst.mockResolvedValue(invite);
      mockPrismaService.listInvite.delete.mockResolvedValue(invite);

      await service.cancelInvite('list-1', 'invite-1');

      expect(mockPrismaService.listInvite.findFirst).toHaveBeenCalledWith({
        where: { id: 'invite-1', listId: 'list-1' },
      });
      expect(mockPrismaService.listInvite.delete).toHaveBeenCalledWith({
        where: { id: 'invite-1' },
      });
    });

    it('should throw NotFoundException when invite not found', async () => {
      mockPrismaService.listInvite.findFirst.mockResolvedValue(null);

      await expect(
        service.cancelInvite('list-1', 'invite-999'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.cancelInvite('list-1', 'invite-999'),
      ).rejects.toThrow('Invite not found');
      expect(mockPrismaService.listInvite.delete).not.toHaveBeenCalled();
    });
  });
});
