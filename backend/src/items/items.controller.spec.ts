import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import type { User } from '@prisma/client';
import { CreateItemDto, UpdateItemDto, ItemResponseDto } from './dto';
import { ListAccessGuard } from '../lists/guards/list-access.guard';
import { ListRoleGuard } from '../lists/guards/list-role.guard';

describe('ItemsController', () => {
  let controller: ItemsController;
  let service: jest.Mocked<ItemsService>;

  const mockUser = {
    id: 'user-1',
    name: 'Test',
    email: 'test@example.com',
  } as unknown as User;

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [{ provide: ItemsService, useValue: mockService }],
    })
      .overrideGuard(ListAccessGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ListRoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ItemsController>(ItemsController);
    service = module.get(ItemsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to itemsService.findAll with listId', async () => {
      const listId = 'list-1';
      const expected: ItemResponseDto[] = [
        { id: 'item-1', name: 'Item 1' } as unknown as ItemResponseDto,
        { id: 'item-2', name: 'Item 2' } as unknown as ItemResponseDto,
      ];

      service.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(listId);

      expect(result).toEqual(expected);
      expect(service.findAll).toHaveBeenCalledWith(listId);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should delegate to itemsService.create with listId, user.id, and dto', async () => {
      const listId = 'list-1';
      const dto: CreateItemDto = {
        name: 'New Item',
      } as unknown as CreateItemDto;

      const expected: ItemResponseDto = {
        id: 'item-1',
        name: 'New Item',
      } as unknown as ItemResponseDto;

      service.create.mockResolvedValue(expected);

      const result = await controller.create(listId, mockUser, dto);

      expect(result).toEqual(expected);
      expect(service.create).toHaveBeenCalledWith(listId, 'user-1', dto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should delegate to itemsService.update with listId, itemId, and dto', async () => {
      const listId = 'list-1';
      const itemId = 'item-1';
      const dto: UpdateItemDto = {
        name: 'Updated Item',
      } as unknown as UpdateItemDto;

      const expected: ItemResponseDto = {
        id: itemId,
        name: 'Updated Item',
      } as unknown as ItemResponseDto;

      service.update.mockResolvedValue(expected);

      const result = await controller.update(listId, itemId, dto);

      expect(result).toEqual(expected);
      expect(service.update).toHaveBeenCalledWith(listId, itemId, dto);
      expect(service.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should delegate to itemsService.remove with listId and itemId', async () => {
      const listId = 'list-1';
      const itemId = 'item-1';

      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(listId, itemId);

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(listId, itemId);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });
});
