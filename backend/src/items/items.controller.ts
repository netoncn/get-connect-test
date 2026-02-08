import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ListRole } from '@prisma/client';
import type { User } from '@prisma/client';
import { ItemsService } from './items.service';
import { CreateItemDto, UpdateItemDto, ItemResponseDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ListAccessGuard } from '../lists/guards/list-access.guard';
import { ListRoleGuard } from '../lists/guards/list-role.guard';
import { ListRoles } from '../lists/decorators/list-roles.decorator';

@ApiTags('items')
@ApiBearerAuth()
@Controller('lists/:listId/items')
@UseGuards(ListAccessGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all items in a list' })
  @ApiParam({ name: 'listId', description: 'List ID' })
  @ApiResponse({ status: 200, type: [ItemResponseDto] })
  async findAll(@Param('listId') listId: string): Promise<ItemResponseDto[]> {
    return this.itemsService.findAll(listId);
  }

  @Post()
  @UseGuards(ListRoleGuard)
  @ListRoles(ListRole.OWNER, ListRole.EDITOR)
  @ApiOperation({ summary: 'Add item to list (owner/editor only)' })
  @ApiParam({ name: 'listId', description: 'List ID' })
  @ApiResponse({ status: 201, type: ItemResponseDto })
  @ApiResponse({ status: 403, description: 'Viewers cannot add items' })
  async create(
    @Param('listId') listId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateItemDto,
  ): Promise<ItemResponseDto> {
    return this.itemsService.create(listId, user.id, dto);
  }

  @Patch(':itemId')
  @UseGuards(ListRoleGuard)
  @ListRoles(ListRole.OWNER, ListRole.EDITOR)
  @ApiOperation({ summary: 'Update item (owner/editor only)' })
  @ApiParam({ name: 'listId', description: 'List ID' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiResponse({ status: 200, type: ItemResponseDto })
  @ApiResponse({ status: 403, description: 'Viewers cannot edit items' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async update(
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemDto,
  ): Promise<ItemResponseDto> {
    return this.itemsService.update(listId, itemId, dto);
  }

  @Delete(':itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ListRoleGuard)
  @ListRoles(ListRole.OWNER, ListRole.EDITOR)
  @ApiOperation({ summary: 'Delete item (owner/editor only)' })
  @ApiParam({ name: 'listId', description: 'List ID' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiResponse({ status: 204, description: 'Item deleted' })
  @ApiResponse({ status: 403, description: 'Viewers cannot delete items' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async remove(
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
  ): Promise<void> {
    return this.itemsService.remove(listId, itemId);
  }
}
