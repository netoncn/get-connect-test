import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ListRole } from '@prisma/client';
import { ListRoleGuard } from './list-role.guard';

describe('ListRoleGuard', () => {
  let guard: ListRoleGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListRoleGuard, Reflector],
    }).compile();

    guard = module.get<ListRoleGuard>(ListRoleGuard);
    reflector = module.get<Reflector>(Reflector);

    jest.clearAllMocks();
  });

  const createMockContext = (
    request: Record<string, unknown>,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  };

  it('should return true when no required roles', () => {
    const mockRequest = { listMembership: { role: ListRole.VIEWER } };
    const mockContext = createMockContext(mockRequest);

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should return true when user role satisfies requirement (OWNER for EDITOR)', () => {
    const mockRequest = { listMembership: { role: ListRole.OWNER } };
    const mockContext = createMockContext(mockRequest);

    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([ListRole.EDITOR]);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when role is insufficient (VIEWER for EDITOR)', () => {
    const mockRequest = { listMembership: { role: ListRole.VIEWER } };
    const mockContext = createMockContext(mockRequest);

    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([ListRole.EDITOR]);

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(mockContext)).toThrow(
      'Insufficient permissions for this action',
    );
  });

  it('should throw ForbiddenException when membership is missing', () => {
    const mockRequest = {};
    const mockContext = createMockContext(mockRequest);

    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([ListRole.VIEWER]);

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(mockContext)).toThrow(
      'List membership not found',
    );
  });

  it('should return true for exact role match', () => {
    const mockRequest = { listMembership: { role: ListRole.EDITOR } };
    const mockContext = createMockContext(mockRequest);

    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([ListRole.EDITOR]);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });
});
