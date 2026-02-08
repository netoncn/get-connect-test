import { Test, TestingModule } from '@nestjs/testing';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import type { User } from '@prisma/client';
import {
  CreateListDto,
  UpdateListDto,
  ListResponseDto,
  ListDetailResponseDto,
} from './dto';
import { ListAccessGuard } from './guards/list-access.guard';
import { ListRoleGuard } from './guards/list-role.guard';

describe('ListsController', () => {
  let controller: ListsController;
  let service: jest.Mocked<ListsService>;

  const mockUser = {
    id: 'user-1',
    name: 'Test',
    email: 'test@example.com',
  } as unknown as User;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListsController],
      providers: [{ provide: ListsService, useValue: mockService }],
    })
      .overrideGuard(ListAccessGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ListRoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ListsController>(ListsController);
    service = module.get(ListsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to listsService.create with user.id and dto', async () => {
      const dto: CreateListDto = { name: 'My List' } as CreateListDto;
      const expected: ListResponseDto = {
        id: 'list-1',
        name: 'My List',
      } as ListResponseDto;

      service.create.mockResolvedValue(expected);

      const result = await controller.create(mockUser, dto);

      expect(result).toEqual(expected);
      expect(service.create).toHaveBeenCalledWith('user-1', dto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should delegate to listsService.findAll with user.id', async () => {
      const expected: ListResponseDto[] = [
        { id: 'list-1', name: 'List 1' } as ListResponseDto,
        { id: 'list-2', name: 'List 2' } as ListResponseDto,
      ];

      service.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual(expected);
      expect(service.findAll).toHaveBeenCalledWith('user-1');
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should delegate to listsService.findOne with listId and user.id', async () => {
      const listId = 'list-1';
      const expected: ListDetailResponseDto = {
        id: listId,
        name: 'My List',
        members: [],
      } as unknown as ListDetailResponseDto;

      service.findOne.mockResolvedValue(expected);

      const result = await controller.findOne(listId, mockUser);

      expect(result).toEqual(expected);
      expect(service.findOne).toHaveBeenCalledWith(listId, 'user-1');
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should delegate to listsService.update with listId and dto', async () => {
      const listId = 'list-1';
      const dto: UpdateListDto = { name: 'Updated List' } as UpdateListDto;
      const expected: ListResponseDto = {
        id: listId,
        name: 'Updated List',
      } as ListResponseDto;

      service.update.mockResolvedValue(expected);

      const result = await controller.update(listId, dto);

      expect(result).toEqual(expected);
      expect(service.update).toHaveBeenCalledWith(listId, dto);
      expect(service.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should delegate to listsService.remove with listId', async () => {
      const listId = 'list-1';

      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(listId);

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(listId);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });
});
