import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy, JwtPayload } from './jwt.strategy';
import { PrismaService } from '../../prisma';

const mockUser = {
  id: 'user-uuid-1234',
  name: 'John Doe',
  email: 'john@example.com',
  passwordHash: 'hashed-password',
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
  updatedAt: new Date('2025-01-01T00:00:00.000Z'),
};

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
};

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue('test-secret'),
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);

    jest.clearAllMocks();
  });

  describe('validate', () => {
    const payload: JwtPayload = {
      sub: 'user-uuid-1234',
      email: 'john@example.com',
    };

    it('should return user when found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: payload.sub },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'User not found',
      );
    });
  });
});
