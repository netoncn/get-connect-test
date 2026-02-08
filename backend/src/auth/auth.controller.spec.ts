import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { User } from '@prisma/client';
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto } from './dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  const mockUser = {
    id: 'user-1',
    name: 'Test',
    email: 'test@example.com',
  } as unknown as User;

  beforeEach(async () => {
    const mockService = {
      register: jest.fn(),
      login: jest.fn(),
      getMe: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should delegate to authService.register with the dto', async () => {
      const dto: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      } as RegisterDto;

      const expected: AuthResponseDto = {
        accessToken: 'jwt-token',
        user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
      } as AuthResponseDto;

      service.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(result).toEqual(expected);
      expect(service.register).toHaveBeenCalledWith(dto);
      expect(service.register).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('should delegate to authService.login with the dto', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      } as LoginDto;

      const expected: AuthResponseDto = {
        accessToken: 'jwt-token',
        user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
      } as AuthResponseDto;

      service.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(result).toEqual(expected);
      expect(service.login).toHaveBeenCalledWith(dto);
      expect(service.login).toHaveBeenCalledTimes(1);
    });
  });

  describe('me', () => {
    it('should delegate to authService.getMe with user.id', async () => {
      const expected: UserResponseDto = {
        id: 'user-1',
        name: 'Test',
        email: 'test@example.com',
      } as UserResponseDto;

      service.getMe.mockResolvedValue(expected);

      const result = await controller.me(mockUser);

      expect(result).toEqual(expected);
      expect(service.getMe).toHaveBeenCalledWith('user-1');
      expect(service.getMe).toHaveBeenCalledTimes(1);
    });
  });
});
