import { Test, TestingModule } from '@nestjs/testing';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';
import type { User } from '@prisma/client';
import {
  CreateInviteDto,
  UpdateMemberDto,
  InviteResponseDto,
  AcceptInviteResponseDto,
} from './dto';
import { ListMemberResponseDto } from '../lists/dto';
import { ListAccessGuard } from '../lists/guards/list-access.guard';
import { ListRoleGuard } from '../lists/guards/list-role.guard';

describe('InvitesController', () => {
  let controller: InvitesController;
  let service: jest.Mocked<InvitesService>;

  const mockUser = {
    id: 'user-1',
    name: 'Test',
    email: 'test@example.com',
  } as unknown as User;

  beforeEach(async () => {
    const mockService = {
      getMembers: jest.fn(),
      createInvite: jest.fn(),
      getPendingInvites: jest.fn(),
      cancelInvite: jest.fn(),
      acceptInvite: jest.fn(),
      updateMemberRole: jest.fn(),
      removeMember: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitesController],
      providers: [{ provide: InvitesService, useValue: mockService }],
    })
      .overrideGuard(ListAccessGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ListRoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<InvitesController>(InvitesController);
    service = module.get(InvitesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMembers', () => {
    it('should delegate to invitesService.getMembers with listId', async () => {
      const listId = 'list-1';
      const expected: ListMemberResponseDto[] = [
        {
          userId: 'user-1',
          name: 'Test',
          role: 'OWNER',
        } as unknown as ListMemberResponseDto,
      ];

      service.getMembers.mockResolvedValue(expected);

      const result = await controller.getMembers(listId);

      expect(result).toEqual(expected);
      expect(service.getMembers).toHaveBeenCalledWith(listId);
      expect(service.getMembers).toHaveBeenCalledTimes(1);
    });
  });

  describe('createInvite', () => {
    it('should delegate to invitesService.createInvite with listId, user.id, and dto', async () => {
      const listId = 'list-1';
      const dto: CreateInviteDto = {
        email: 'invited@example.com',
        role: 'EDITOR',
      } as unknown as CreateInviteDto;

      const expected: InviteResponseDto = {
        id: 'invite-1',
        email: 'invited@example.com',
        token: 'invite-token',
      } as unknown as InviteResponseDto;

      service.createInvite.mockResolvedValue(expected);

      const result = await controller.createInvite(listId, mockUser, dto);

      expect(result).toEqual(expected);
      expect(service.createInvite).toHaveBeenCalledWith(listId, 'user-1', dto);
      expect(service.createInvite).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPendingInvites', () => {
    it('should delegate to invitesService.getPendingInvites with listId', async () => {
      const listId = 'list-1';
      const expected: InviteResponseDto[] = [
        {
          id: 'invite-1',
          email: 'pending@example.com',
        } as unknown as InviteResponseDto,
      ];

      service.getPendingInvites.mockResolvedValue(expected);

      const result = await controller.getPendingInvites(listId);

      expect(result).toEqual(expected);
      expect(service.getPendingInvites).toHaveBeenCalledWith(listId);
      expect(service.getPendingInvites).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancelInvite', () => {
    it('should delegate to invitesService.cancelInvite with listId and inviteId', async () => {
      const listId = 'list-1';
      const inviteId = 'invite-1';

      service.cancelInvite.mockResolvedValue(undefined);

      const result = await controller.cancelInvite(listId, inviteId);

      expect(result).toBeUndefined();
      expect(service.cancelInvite).toHaveBeenCalledWith(listId, inviteId);
      expect(service.cancelInvite).toHaveBeenCalledTimes(1);
    });
  });

  describe('acceptInvite', () => {
    it('should delegate to invitesService.acceptInvite with token and user.id', async () => {
      const token = 'invite-token-abc';
      const expected: AcceptInviteResponseDto = {
        listId: 'list-1',
        role: 'EDITOR',
      } as unknown as AcceptInviteResponseDto;

      service.acceptInvite.mockResolvedValue(expected);

      const result = await controller.acceptInvite(token, mockUser);

      expect(result).toEqual(expected);
      expect(service.acceptInvite).toHaveBeenCalledWith(token, 'user-1');
      expect(service.acceptInvite).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateMemberRole', () => {
    it('should delegate to invitesService.updateMemberRole with listId, targetUserId, and dto', async () => {
      const listId = 'list-1';
      const targetUserId = 'user-2';
      const dto: UpdateMemberDto = {
        role: 'VIEWER',
      } as unknown as UpdateMemberDto;
      const expected: ListMemberResponseDto = {
        userId: 'user-2',
        role: 'VIEWER',
      } as unknown as ListMemberResponseDto;

      service.updateMemberRole.mockResolvedValue(expected);

      const result = await controller.updateMemberRole(
        listId,
        targetUserId,
        dto,
      );

      expect(result).toEqual(expected);
      expect(service.updateMemberRole).toHaveBeenCalledWith(
        listId,
        targetUserId,
        dto,
      );
      expect(service.updateMemberRole).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeMember', () => {
    it('should delegate to invitesService.removeMember with listId and targetUserId', async () => {
      const listId = 'list-1';
      const targetUserId = 'user-2';

      service.removeMember.mockResolvedValue(undefined);

      const result = await controller.removeMember(listId, targetUserId);

      expect(result).toBeUndefined();
      expect(service.removeMember).toHaveBeenCalledWith(listId, targetUserId);
      expect(service.removeMember).toHaveBeenCalledTimes(1);
    });
  });
});
