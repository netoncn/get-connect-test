import { ExecutionContext, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ListAccessGuard } from './list-access.guard';
import { PrismaService } from '../../prisma';

const mockPrismaService = {
  list: {
    findUnique: jest.fn(),
  },
};

describe('ListAccessGuard', () => {
  let guard: ListAccessGuard;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListAccessGuard,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    guard = module.get<ListAccessGuard>(ListAccessGuard);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  const createMockContext = (request: Record<string, unknown>): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should return true when no listId in params', async () => {
    const mockRequest = { user: { id: 'user-1' }, params: {} };
    const mockContext = createMockContext(mockRequest);

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(prisma.list.findUnique).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when list not found', async () => {
    const mockRequest = { user: { id: 'user-1' }, params: { listId: 'list-1' } };
    const mockContext = createMockContext(mockRequest);

    prisma.list.findUnique.mockResolvedValue(null);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(NotFoundException);
    await expect(guard.canActivate(mockContext)).rejects.toThrow('List not found');

    expect(prisma.list.findUnique).toHaveBeenCalledWith({
      where: { id: 'list-1' },
      include: { members: { where: { userId: 'user-1' } } },
    });
  });

  it('should throw ForbiddenException when user is not a member', async () => {
    const mockRequest = { user: { id: 'user-1' }, params: { listId: 'list-1' } };
    const mockContext = createMockContext(mockRequest);

    prisma.list.findUnique.mockResolvedValue({
      id: 'list-1',
      name: 'Test List',
      members: [],
    });

    await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      'You are not a member of this list',
    );
  });

  it('should set request.list and request.listMembership on success', async () => {
    const mockRequest: Record<string, unknown> = {
      user: { id: 'user-1' },
      params: { listId: 'list-1' },
    };
    const mockContext = createMockContext(mockRequest);

    const mockMembership = { id: 'member-1', userId: 'user-1', role: 'OWNER' };
    const mockList = {
      id: 'list-1',
      name: 'Test List',
      members: [mockMembership],
    };

    prisma.list.findUnique.mockResolvedValue(mockList);

    await guard.canActivate(mockContext);

    expect(mockRequest.list).toEqual(mockList);
    expect(mockRequest.listMembership).toEqual(mockMembership);
  });

  it('should return true when user is a valid member', async () => {
    const mockRequest: Record<string, unknown> = {
      user: { id: 'user-1' },
      params: { listId: 'list-1' },
    };
    const mockContext = createMockContext(mockRequest);

    const mockMembership = { id: 'member-1', userId: 'user-1', role: 'EDITOR' };
    const mockList = {
      id: 'list-1',
      name: 'Test List',
      members: [mockMembership],
    };

    prisma.list.findUnique.mockResolvedValue(mockList);

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(prisma.list.findUnique).toHaveBeenCalledWith({
      where: { id: 'list-1' },
      include: { members: { where: { userId: 'user-1' } } },
    });
  });
});
